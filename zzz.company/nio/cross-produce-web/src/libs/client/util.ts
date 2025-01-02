export const isArray = (obj: any): obj is any[] => {
  return Object.prototype.toString.apply(obj).includes('Array');
};

export const isObject = (obj: any): obj is { [key: string]: any } => {
  return typeof obj === 'object';
};

export const capitalizeOptions = (options: { label: string; value: number; }[]): { label: string; value: number; }[] => {
  return options.map(option => ({
    ...option,
    label: option.label.charAt(0).toUpperCase() + option.label.slice(1)
  }));
};
