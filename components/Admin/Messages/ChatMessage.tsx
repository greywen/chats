import { IconCheck, IconCopy, IconRobot, IconUser } from '@tabler/icons-react';
import { FC, memo, useState } from 'react';
import { Message } from '@/types/chat';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { MemoizedReactMarkdown } from '@/components/Markdown/MemoizedReactMarkdown';
import { CodeBlock } from '@/components/Markdown/CodeBlock';

export interface Props {
  message: Message;
}

export const ChatMessage: FC<Props> = memo(({ message }) => {
  const [messagedCopied, setMessageCopied] = useState(false);

  const copyOnClick = () => {
    if (!navigator.clipboard) return;

    navigator.clipboard.writeText(message.content.text || '').then(() => {
      setMessageCopied(true);
      setTimeout(() => {
        setMessageCopied(false);
      }, 2000);
    });
  };

  return (
    <div
      className={`group md:px-4 ${
        message.role === 'assistant'
          ? 'text-gray-800 dark:text-gray-100'
          : 'text-gray-800 dark:text-gray-100'
      }`}
      style={{ overflowWrap: 'anywhere' }}
    >
      <div className='relative m-auto flex p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-5xl'>
        <div className='min-w-[40px] text-right font-bold'>
          {message.role === 'assistant' ? (
            <IconRobot size={30} />
          ) : (
            <IconUser size={30} />
          )}
        </div>

        <div className='prose mt-[-2px] w-full dark:prose-invert'>
          {message.role === 'user' ? (
            <div className='flex w-full justify-between'>
              <div>
                <div className='flex flex-wrap gap-2'>
                  {message.content?.image &&
                    message.content.image.map((img, index) => (
                      <img
                        className='rounded-md mr-2'
                        key={index}
                        style={{ maxWidth: 268, maxHeight: 168 }}
                        src={img}
                        alt=''
                      />
                    ))}
                </div>
                <div
                  className={`prose whitespace-pre-wrap dark:prose-invert ${
                    message.content?.image && message.content.image.length > 0
                      ? 'mt-2'
                      : ''
                  }`}
                >
                  {message.content.text}
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-row'>
              <MemoizedReactMarkdown
                className='prose dark:prose-invert flex-1 leading-8'
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeMathjax]}
                components={{
                  code({ node, className, inline, children, ...props }) {
                    if (children.length) {
                      if (children[0] == '▍') {
                        return (
                          <span className='animate-pulse cursor-default mt-1'>
                            ▍
                          </span>
                        );
                      }

                      children[0] = (children[0] as string).replace('`▍`', '▍');
                    }

                    const match = /language-(\w+)/.exec(className || '');

                    return !inline ? (
                      <CodeBlock
                        key={Math.random()}
                        language={(match && match[1]) || ''}
                        value={String(children).replace(/\n$/, '')}
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <table className='border-collapse border border-black px-3 py-1 dark:border-white'>
                        {children}
                      </table>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className='break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white'>
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className='break-words border border-black px-3 py-1 dark:border-white'>
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {`${message.content.text}`}
              </MemoizedReactMarkdown>

              <div className='md:-mr-8 ml-1 md:ml-0 flex flex-col md:flex-row gap-4 md:gap-1 items-center md:items-start justify-end md:justify-start'>
                {messagedCopied ? (
                  <IconCheck
                    size={20}
                    className='text-green-500 dark:text-green-400'
                  />
                ) : (
                  <button
                    className='invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    onClick={copyOnClick}
                  >
                    <IconCopy size={20} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
ChatMessage.displayName = 'ChatMessage';