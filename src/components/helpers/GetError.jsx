export const getError = (error) => {
    return error.response && error.response.data.error
      ? error.response.data.error
      : error.message;
};
    