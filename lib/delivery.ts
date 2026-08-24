export type InPostPoint = { id: string; address: string };

// MVP: statyczna lista punktów. Docelowo do zastąpienia InPost Geowidgetem (wymaga klucza API).
export const INPOST_POINTS: InPostPoint[] = [
  { id: "WAW01M", address: "ul. Marszałkowska 100, Warszawa" },
  { id: "KRA02M", address: "ul. Floriańska 12, Kraków" },
  { id: "WRO03M", address: "ul. Rynek 5, Wrocław" },
  { id: "GDA04M", address: "ul. Długa 20, Gdańsk" },
  { id: "POZ05M", address: "ul. Półwiejska 30, Poznań" },
];
