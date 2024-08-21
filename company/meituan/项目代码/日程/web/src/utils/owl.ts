import { webViewType, isMac } from './environment';

export function setMetric(metricKey: string, metricValue: number, tag?: any) {
  const metricInst = window.Owl && window.Owl.MetricManager();
  metricInst
      && metricInst.setTags({
        webViewType,
        OS: isMac ? 0 : 1,
        ...tag
      });
  metricInst && metricInst.setMetric(metricKey, metricValue);
}
