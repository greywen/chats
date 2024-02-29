import { useCreateReducer } from '@/hooks/useCreateReducer';
import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';
import { Conversation } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { ModelIds } from '@/types/model';
import { DEFAULT_TEMPERATURE } from '@/utils/const';
import {
  cleanConversationHistory,
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/conversation';
import { KeyValuePair } from '@/types/data';
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/Navbar/Navbar';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Chat } from '@/components/Chat/Chat';
import { useQuery } from 'react-query';
import useApiService from '@/apis/useApiService';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getSettings } from '@/utils/settings';
import Promptbar from '@/components/Promptbar';
import { getSession } from '@/utils/session';
import { Session } from '@/types/session';
import { getUserSession } from '@/utils/user';
import { useRouter } from 'next/router';

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: ModelIds;
  session: Session;
}

const Home = ({ defaultModelId, session }: Props) => {
  const router = useRouter();
  const { t } = useTranslation('chat');
  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: { user, conversations, selectedConversation, lightMode, models },
    dispatch,
  } = contextValue;
  const { getModels } = useApiService();
  const stopConversationRef = useRef<boolean>(false);
  const [loadingText, setLoadingText] = useState('');

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];
    const _defaultModelId = defaultModelId ?? models[0].modelId;
    const model = lastConversation?.model || getModel(_defaultModelId);
    const newConversation: Conversation = {
      id: uuidv4(),
      name: t('New Conversation'),
      messages: [],
      model: model,
      prompt: t(model.systemPrompt),
      temperature: DEFAULT_TEMPERATURE,
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch({ field: 'selectedConversation', value: newConversation });
    dispatch({ field: 'conversations', value: updatedConversations });

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    dispatch({ field: 'loading', value: false });
  };

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      field: 'selectedConversation',
      value: conversation,
    });

    saveConversation(conversation);
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair | KeyValuePair[]
  ) => {
    let updatedConversation = { ...conversation };

    if (Array.isArray(data)) {
      data.forEach((pair) => {
        updatedConversation = {
          ...updatedConversation,
          [pair.key]: pair.value,
        };
      });
    } else {
      updatedConversation = {
        ...updatedConversation,
        [data.key]: data.value,
      };
    }

    const { single, all } = updateConversation(
      updatedConversation,
      conversations
    );

    dispatch({ field: 'selectedConversation', value: single });
    dispatch({ field: 'conversations', value: all });
  };

  const hasModel = () => {
    return models?.length > 0;
  };

  const getModel = (modelId: string) => {
    return models.find((x) => x.modelId === modelId)!;
  };

  useEffect(() => {
    setLoadingText(t('Loading ...')!);
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: 'lightMode',
        value: settings.theme,
      });
    }

    const user = getUserSession();
    if (user) {
      dispatch({ field: 'user', value: user });
    } else {
      router.push('/login');
    }

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      dispatch({ field: 'prompts', value: JSON.parse(prompts) });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' });
    }
  }, []);

  useEffect(() => {
    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory
      );

      dispatch({ field: 'conversations', value: cleanedConversationHistory });
    }
    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);

      dispatch({
        field: 'selectedConversation',
        value: parsedSelectedConversation,
      });
    } else {
      if (!models || models.length === 0) return;
      const lastConversation = conversations[conversations.length - 1];
      const _defaultModelId = defaultModelId
        ? defaultModelId
        : models[0]?.modelId;
      const model = lastConversation?.model || getModel(_defaultModelId);
      dispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          model: model,
          prompt: t(model.systemPrompt),
          temperature: DEFAULT_TEMPERATURE,
        },
      });
    }
  }, [defaultModelId, models, dispatch]);

  const { data } = useQuery(
    ['GetModels'],
    ({ signal }) => {
      return getModels({}, signal);
    },
    {}
  );

  useEffect(() => {
    dispatch({
      field: 'modelsLoading',
      value: true,
    });
    if (data && data.length > 0) {
      dispatch({
        field: 'defaultModelId',
        value: data[0].modelId,
      });
    }
    dispatch({ field: 'models', value: data });
    dispatch({
      field: 'modelsLoading',
      value: false,
    });
  }, [data, dispatch]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleSelectConversation,
        handleUpdateConversation,
        hasModel,
        getModel,
      }}
    >
      <Head>
        <title>Chats</title>
        <meta name='description' content='' />
        <meta
          name='viewport'
          content='height=device-height ,width=device-width, initial-scale=1, user-scalable=no'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        {/* {status !== 'authenticated' && (
          <div
            className={`fixed top-1/2 w-full h-full z-50 text-center text-sm`}
          >
            {loadingText}
          </div>
        )} */}
        {selectedConversation && (
          <div
            className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
          >
            <div className='fixed top-0 w-full sm:hidden'>
              <Navbar
                selectedConversation={selectedConversation}
                onNewConversation={handleNewConversation}
                hasModel={hasModel}
              />
            </div>

            <div className='flex h-full w-full pt-[48px] sm:pt-0'>
              <Chatbar />
              <div className='flex flex-1'>
                <Chat stopConversationRef={stopConversationRef} />
              </div>
              <Promptbar />
            </div>
          </div>
        )}
      </main>
    </HomeContext.Provider>
  );
};

export default Home;

export const getServerSideProps = async ({
  locale,
  req,
  res,
}: {
  locale: string;
  req: any;
  res: any;
}) => {
  const session = await getSession(req.headers.cookie);
  return {
    props: {
      session,
      defaultModelId: null,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};