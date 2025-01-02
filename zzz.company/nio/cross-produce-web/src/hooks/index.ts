import {TablePaginationConfig} from 'antd';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {removeEmptyValue} from '../utils/objects';

export interface EditState<T = any> {
  visible: boolean;
  show: () => void;
  hide: () => void;
  setItem: (i: T) => void;
  getItem: () => T | undefined;
}

/**
 * 用于编辑状态的hook
 * @returns
 */
export const useEditState = <T = any>() => {
  const [visible, setVisible] = useState(false);
  const item = useRef<T>();
  const show = () => {
    setVisible(true);
  };
  const hide = () => {
    console.log('hide', visible);
    setVisible(false);
  };

  const setItem = (i: T) => {
    item.current = i;
  };

  const getItem = (): T | undefined => {
    return item.current;
  };

  return {
    visible,
    show,
    hide,
    setItem,
    getItem,
  };
};

export function useQuery<T>(
  q?: string,
): T extends {[key: string]: any}
  ? Omit<URLSearchParams, 'get'> & {get<K extends keyof T>(name: K): T[K] | null}
  : URLSearchParams {
  const location = useLocation();

  // @ts-expect-error
  return new URLSearchParams(q ?? location.search);
}

export const usePageFns = (pathname?: string) => {
  const loc = useLocation();
  const location_search = loc.search;
  const [query, setQuery] = useState<URLSearchParams>(new URLSearchParams(location_search));
  // let history = useHistory();
  let navigate = useNavigate();

  const [pageOptions, setPageOptions] = useState({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    if (!location_search.toString().length) {
      const newQuery = new URLSearchParams();
      newQuery.set('page', '1');
      newQuery.set('limit', '10');
      setQuery(newQuery);
    } else {
      const newQuery = new URLSearchParams(location_search);
      setQuery(newQuery);
    }
  }, [query.toString()]);

  const getQuery = () => {
    return {
      page: query.get('page') || '1',
      limit: query.get('limit') || '10',
    };
  };

  /**
   * 用来改变页面路径
   * @param newSearchForm
   * @param pathname
   */
  const changeHistory = (newSearchForm: Record<string, any>, pathname: string = loc.pathname) => {
    const processedForm = Object.entries(newSearchForm).reduce((acc, [key, value]) => {
      // 如果是数组，将其转换为逗号分隔的字符串
      if (Array.isArray(value)) {
        acc[key] = value.join(',');
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const newQuery = new URLSearchParams(
      removeEmptyValue({
        ...processedForm,
        _ts: Date.now().toString(),
      }),
    ).toString();
    
    if (newQuery === '') {
      navigate(pathname);
    } else {
      navigate({
        pathname,
        search: newQuery,
      });
    }
  };

  const handleChange = useMemo(
    () =>
      (
        options: TablePaginationConfig,
        searchForm: {
          [k: string]: any;
        },
      ) => {
        setPageOptions({...pageOptions, page: options.current ?? 1, limit: options.pageSize ?? 10});

        const newQuery = new URLSearchParams();
        newQuery.set('page', options.current?.toString() ?? '1');
        newQuery.set('limit', options.pageSize?.toString() ?? '10');
        Object.keys(searchForm).map((s) => {
          if (s !== 'page' && s !== 'limit') {
            newQuery.set(s, searchForm[s]);
          }
        });

        navigate({
          pathname: pathname,
          search: newQuery.toString(),
        });

        setQuery(newQuery);
      },
    [],
  );

  return {
    handleChange,
    changeHistory,
    getQuery,
  };
};
