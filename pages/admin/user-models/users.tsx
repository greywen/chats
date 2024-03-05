import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Input,
  Button,
  Card,
  CardHeader,
  Avatar,
  CardBody,
  CardFooter,
  Spinner,
} from '@nextui-org/react';
import { getUserModels } from '@/apis/adminService';
import { GetUserModelResult } from '@/types/admin';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { AddUserModelModal } from '@/components/Admin/addUserModelModal';
import { EditUserModelModal } from '@/components/Admin/editUserModelModal';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useThrottle } from '@/hooks/useThrottle';

export default function UserModels() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState({ add: false, edit: false });
  const [selectedUserModel, setSelectedUserModel] =
    useState<GetUserModelResult | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>();
  const [userModels, setUserModels] = useState<GetUserModelResult[]>([]);
  const [loadingModel, setLoadingModel] = useState(false);
  const [query, setQuery] = useState<string>('');
  const throttledValue = useThrottle(query, 1000);

  useEffect(() => {
    init();
  }, [throttledValue]);

  const init = () => {
    getUserModels(query).then((data) => {
      setUserModels(data);
      setIsOpen({ add: false, edit: false });
      setSelectedUserModel(null);
      setLoadingModel(false);
    });
  };

  const handleShowAddModal = (item: GetUserModelResult) => {
    setSelectedUserModel(item);
    setIsOpen({ add: true, edit: false });
  };

  const handleShowEditModal = (item: GetUserModelResult, modelId: string) => {
    setSelectedModelId(modelId);
    setSelectedUserModel(item);
    setIsOpen({ add: false, edit: true });
  };

  const handleClose = () => {
    setIsOpen({ add: false, edit: false });
    setSelectedUserModel(null);
  };

  return (
    <>
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex justify-between gap-3 items-center'>
          <Input
            isClearable
            classNames={{
              base: 'w-full',
            }}
            placeholder={t('Search by name...')!}
            startContent={<IconSearch className='text-default-300' />}
            value={query}
            onClear={() => setQuery('')}
            onValueChange={(value: string) => {
              setQuery(value);
            }}
          />
        </div>
      </div>
      {loadingModel && (
        <Spinner
          className='flex justify-center my-20'
          label={t('Loading...')!}
        />
      )}
      <div className='grid w-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
        {!loadingModel &&
          userModels.map((item) => {
            return (
              <Card key={item.userId} className='p-2 max-h-[309px]'>
                <CardHeader className='justify-between'>
                  <div className='flex gap-5'>
                    <Avatar
                      isBordered
                      // color='success'
                      icon={
                        <div className=' bg-gray-200 w-full h-full flex justify-center items-center font-semibold text-sm'>
                          {item.userName[0].toUpperCase()}
                        </div>
                      }
                    />
                    <div className='flex flex-col gap-1 items-start justify-center'>
                      <h4 className='text-small font-semibold leading-none text-default-600'>
                        {item.userName}
                      </h4>
                      <h5 className='text-small tracking-tight text-default-400'>
                        {item.role || '-'}
                      </h5>
                    </div>
                  </div>
                  <Button
                    color='primary'
                    radius='full'
                    size='sm'
                    variant='flat'
                    onClick={() => handleShowAddModal(item)}
                  >
                    <IconPlus size={18} />
                  </Button>
                </CardHeader>
                <CardBody className='px-3 py-0 text-small text-default-400'>
                  <Table removeWrapper>
                    <TableHeader>
                      <TableColumn>{t('ID')}</TableColumn>
                      <TableColumn>{t('Remaining Tokens')}</TableColumn>
                      <TableColumn>{t('Remaining Counts')}</TableColumn>
                      <TableColumn>{t('Expiration Time')}</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {item.models
                        .filter((x) => x.enable)
                        .map((m) => {
                          return (
                            <TableRow
                              key={m.modelId}
                              className='hover:bg-gray-100'
                            >
                              <TableCell
                                className='hover:underline'
                                onClick={() =>
                                  handleShowEditModal(item, m.modelId)
                                }
                              >
                                <Tooltip
                                  content={
                                    m.enable ? t('Enabled') : t('Disabled')
                                  }
                                >
                                  <Chip
                                    className='capitalize border-none gap-1 text-default-600'
                                    color={m.enable ? 'success' : 'default'}
                                    size='sm'
                                    variant='dot'
                                  ></Chip>
                                </Tooltip>
                                {m.modelId}
                              </TableCell>
                              <TableCell>{m.tokens || '-'}</TableCell>
                              <TableCell>{m.counts || '-'}</TableCell>
                              <TableCell>{m.expires || '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardBody>
                <CardFooter className='gap-3'></CardFooter>
              </Card>
            );
          })}
      </div>
      <AddUserModelModal
        selectedModel={selectedUserModel}
        onSuccessful={init}
        onClose={handleClose}
        isOpen={isOpen.add}
      ></AddUserModelModal>

      <EditUserModelModal
        selectedModelId={selectedModelId!}
        selectedUserModel={selectedUserModel}
        onSuccessful={init}
        onClose={handleClose}
        isOpen={isOpen.edit}
      ></EditUserModelModal>
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'admin'])),
    },
  };
};