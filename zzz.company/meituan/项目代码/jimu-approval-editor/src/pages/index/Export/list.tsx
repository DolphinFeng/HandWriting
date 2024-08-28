import { Loading, Table, Pagination } from '@ss/mtd-react';
import React, { useCallback, useState } from 'react';
import { format } from 'date-fns';
import Styles from './index.less';
import { ExportState } from './index.type';
import { SEARCH_RECORDS_QUERY } from '@/services/export';
import { useFetch } from '@/services/useRequest';

const { Column } = Table;

interface IProps {
  handleRetry: Function;
}

interface IPage {
  pageNo: number;
  pageSize?: number;
  totalCount?: number;
  totalPageCount?: number;
}

const defaultPageSize = 10;

export default function ExportList(props: IProps) {
  const { handleRetry } = props;

  const [page, setPage] = useState<IPage>({
    pageNo: 1,
    pageSize: defaultPageSize
  });

  const { loading, result, fetchData, updateResult } = useFetch<any>(
    SEARCH_RECORDS_QUERY,
    'post',
    page
  );

  const handleInnerRetry = useCallback(
    (row) => {
      handleRetry(row);
    },
    [handleRetry]
  );

  const handlePageChange = useCallback(
    (pageNo) => {
      setPage(() => {
        return {
          pageNo,
          pageSize: defaultPageSize
        };
      });

      fetchData({
        pageNo,
        pageSize: defaultPageSize
      }).then((data) => {
        updateResult(data);
      });
    },
    [fetchData, setPage, updateResult]
  );

  const handlePageRefresh = useCallback(() => {
    const { pageNo, pageSize } = page;

    fetchData({
      pageNo,
      pageSize
    }).then((data) => {
      updateResult(data);
    });
  }, [fetchData, updateResult]);

  return (
    <Loading loading={loading}>
      <Table
        data={result?.pageList || []}
        bordered='cell'
        className={Styles['export-container']}
      >
        <Column dataKey='pdName' className={Styles.bold}>
          流程名称
        </Column>
        <Column
          width={200}
          dataKey='exportUserName'
          render={(name, row) => {
            return (
              <div className={Styles['export-user']}>
                <div className={Styles.bold}>{name}</div>
                <span>{format(new Date(row.crtTs), 'yyyy-MM-dd HH:mm')}</span>
              </div>
            );
          }}
        >
          导出人/时间
        </Column>
        <Column
          width={200}
          dataKey='billSubmitFrom'
          render={(_val, row) => {
            return (
              <>
                <div>
                  {format(new Date(row.billSubmitFrom), 'yyyy-MM-dd HH:mm')} 至{' '}
                </div>
                <div>
                  {format(new Date(row.billSubmitTo), 'yyyy-MM-dd HH:mm')}
                </div>
              </>
            );
          }}
        >
          单据提交时间
        </Column>
        <Column
          dataKey='progress'
          render={(progress, row) => {
            switch (progress) {
              case ExportState.CREATING:
                return (
                  <span>
                    导出中，请
                    <a
                      onClick={() => {
                        handlePageRefresh();
                      }}
                    >
                      刷新
                    </a>
                    查看
                  </span>
                );
              case ExportState.UPLOADED:
                return (
                  <a target='_blank' href={row.url}>
                    下载
                  </a>
                );
              case ExportState.DELETED:
                return (
                  <div>
                    文件已过期，
                    <a
                      onClick={() => {
                        handleInnerRetry(row);
                      }}
                    >
                      请重新查询
                    </a>
                  </div>
                );
              case ExportState.FAILED:
                return (
                  <div>
                    导出失败，
                    <a
                      onClick={() => {
                        handleInnerRetry(row);
                      }}
                    >
                      请重试
                    </a>
                  </div>
                );
              default:
                return '未知状态';
            }
          }}
        >
          操作
        </Column>
      </Table>
      <Pagination
        style={{ textAlign: 'right', marginTop: '10px' }}
        size='small'
        pageSize={defaultPageSize}
        current={page.pageNo}
        total={result?.page?.totalCount || 10}
        onChange={handlePageChange}
      ></Pagination>
    </Loading>
  );
}
