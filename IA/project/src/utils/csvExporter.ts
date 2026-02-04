import { LiveData } from '../types';

export function exportToCSV(data: LiveData[], fileName: string): void {
  const headers = [
    'timestamp',
    'elapsed_time',
    'voltaje',
    'corriente',
    'potencia',
    'T_ch0',
    'T_ch1',
    'T_ch2',
    'T_ch3',
    'T_ch4',
    'T_ch5',
    'T_ch6',
    'T_ch7',
    'T_evap_avg',
    'T_cond_avg',
    'R_thermal',
    'relay_1',
    'relay_2',
    'relay_3',
    'relay_4',
  ];

  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof LiveData];
          return typeof value === 'boolean' ? (value ? '1' : '0') : value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
