import { themeQuartz } from 'ag-grid-community';

const exhibitflowTheme = themeQuartz.withParams({
  accentColor: '#D17E08',
  backgroundColor: '#101010',
  borderColor: '#1F1F1F',
  borderRadius: 2,
  browserColorScheme: 'dark',
  cellHorizontalPaddingScale: 0.5,
  chromeBackgroundColor: {
    ref: 'backgroundColor',
  },
  columnBorder: true,
  fontFamily: {
    googleFont: 'Roboto',
  },
  fontSize: 14,
  foregroundColor: '#CECECE',
  headerBackgroundColor: '#141414',
  headerFontFamily: 'inherit',
  headerFontSize: 13,
  headerFontWeight: 400,
  headerTextColor: '#CECECE',
  rowBorder: true,
  rowVerticalPaddingScale: 0.6,
  sidePanelBorder: true,
  spacing: 6,
  wrapperBorder: true,
  wrapperBorderRadius: 8,
});

export default exhibitflowTheme;
