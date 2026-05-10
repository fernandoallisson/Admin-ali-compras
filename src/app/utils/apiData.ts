export const getApiList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;

  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  const nested = data?.data;
  if (Array.isArray(nested?.data)) return nested.data;
  if (Array.isArray(nested?.results)) return nested.results;

  return [];
};
