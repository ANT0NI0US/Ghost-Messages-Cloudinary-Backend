export const getIssuer = (req) => {
  return `${req.protocol}://${req.host}`;
};
