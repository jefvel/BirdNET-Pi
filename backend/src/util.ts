export const getFileName = (path: string) => {
  return path.replace(/^.*[\\/]/, '');
};
