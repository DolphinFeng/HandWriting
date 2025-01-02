export const normFile = (e: any) => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.file.originFileObj;
};

export const getSelectOptions = (data: Array<[string, any]>) => {
  return data.map(([value, label]) => {
    return {
      label,
      value,
    };
  });
};
