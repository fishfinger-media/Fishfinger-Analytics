import type { ReportSlideData } from './report-data';
import {
  renderBackCover,
  renderChannels,
  renderCountries,
  renderDevicesAndBrowsers,
  renderEntryPages,
  renderExitPages,
  renderFrontCover,
  renderKPIs,
  renderOS,
  renderSources,
  renderTimeseries,
  renderTopPages,
  renderUtmAndConversions,
} from './slides';

export type SlideSpec = {
  label: string;
  render: (container: HTMLDivElement, ...args: never[]) => void;
  args: unknown[];
};

export function getSlideSpecs(
  siteId: string,
  dateFrom: string,
  dateTo: string,
  data: ReportSlideData
): SlideSpec[] {
  const meta = { siteId, dateFrom, dateTo };
  return [
    { label: 'Front cover', render: renderFrontCover as never, args: [siteId, dateFrom, dateTo] },
    { label: 'Overview KPIs', render: renderKPIs as never, args: [meta, data.aggregate, data.aggregatePrev] },
    { label: 'Traffic over time', render: renderTimeseries as never, args: [meta, data.timeseries] },
    { label: 'Top pages', render: renderTopPages as never, args: [meta, data.pages, data.pagesPrev] },
    { label: 'Visitors by country', render: renderCountries as never, args: [meta, data.countries] },
    { label: 'Traffic sources', render: renderSources as never, args: [meta, data.sources, data.sourcesPrev] },
    { label: 'Channels', render: renderChannels as never, args: [meta, data.channels, data.channelsPrev] },
    {
      label: 'Devices & browsers',
      render: renderDevicesAndBrowsers as never,
      args: [meta, data.devices, data.browsers, data.devicesPrev, data.browsersPrev],
    },
    { label: 'Operating systems', render: renderOS as never, args: [meta, data.os, data.osPrev] },
    {
      label: 'UTM & conversions',
      render: renderUtmAndConversions as never,
      args: [meta, data.utmMediums, data.conversions, data.utmMediumsPrev, data.conversionsPrev],
    },
    {
      label: 'Entry pages',
      render: renderEntryPages as never,
      args: [meta, data.entryPages, data.entryPagesPrev],
    },
    {
      label: 'Exit pages',
      render: renderExitPages as never,
      args: [meta, data.exitPages, data.exitPagesPrev],
    },
    { label: 'Back cover', render: renderBackCover as never, args: [siteId, dateFrom, dateTo] },
  ];
}
