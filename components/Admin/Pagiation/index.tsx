import { useTranslation } from 'next-i18next';
import {
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Pagination,
} from '../../ui/pagination';

const PaginationContainer = ({
  page,
  pageSize,
  currentCount,
  totalCount,
  onPagingChange,
}: {
  page: number;
  pageSize: number;
  currentCount: number;
  totalCount: number;
  onPagingChange: (page: number, pageSize: number) => void;
}) => {
  const { t } = useTranslation('pagination');
  function previous() {
    onPagingChange(page - 1, pageSize);
  }

  function next() {
    onPagingChange(page + 1, pageSize);
  }

  return (
    <div className='flex w-full p-4 items-center justify-between'>
      <div>
        {t(
          'Showing {{currentCount}} - {{currentTotalCount}} total {{totalCount}}',
          {
            currentCount: page === 1 ? 1 : (page - 1) * pageSize,
            currentTotalCount:
              currentCount < pageSize ? totalCount : page * pageSize,
            totalCount: totalCount,
          }
        )}
      </div>
      <div>
        <Pagination className='justify-normal'>
          <PaginationContent>
            <PaginationItem
              className={page === 1 ? 'pointer-events-none' : ''}
              onClick={previous}
            >
              <PaginationPrevious>{t('Previous')}</PaginationPrevious>
            </PaginationItem>
            <PaginationItem
              className={
                totalCount <= page * pageSize ? 'pointer-events-none' : ''
              }
              onClick={next}
            >
              <PaginationNext>{t('Next')}</PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default PaginationContainer;