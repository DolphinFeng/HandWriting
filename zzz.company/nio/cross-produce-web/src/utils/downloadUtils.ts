import { message } from 'antd';

export const jsonToCsv = (jsonData: any) => {
  const csvRows = [];
  const headers = Object.keys(jsonData[0]);
  csvRows.push(headers.join(','));
  for (const row of jsonData) {
    const values = headers.map((header) => {
      if (typeof row[header] === 'object') {
        let rowValue = JSON.stringify(row[header]).replace(/,/g, '，');
        return `"${rowValue}"`;
      } else if (Array.isArray(row[header])) {
        let Value = row[header].map((value: any) => {
          return JSON.stringify(value).replace(/,/g, '，');
        });
        return `"${Value}"`;
      } else {
        return `${('' + row[header]).replace(/,/g, '，')}`;
      }
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
};

export const downloadFile = (fileName: string, data: string) => {
  let aLink = document.createElement('a');
  let blob = new Blob([data]);
  aLink.download = fileName;
  aLink.href = URL.createObjectURL(blob);
  aLink.click();
};

export const handleDownload = async (fetchData: () => Promise<any>, fileName: string) => {
  try {
    const data = await fetchData();
    if (data.length > 0) {
      const csvData = jsonToCsv(data);
      downloadFile(fileName, csvData);
    } else {
      message.warning('没有可下载的内容');
    }
  } catch (error: any) {
    console.error(error);
    message.error(error.message);
  }
}; 