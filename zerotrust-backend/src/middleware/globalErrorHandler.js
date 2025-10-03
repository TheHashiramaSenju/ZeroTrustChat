// A centralized error handler to catch all unhandled errors and send a consistent response.

const globalErrorHandler = (err, req, res, next) => {
    console.error("--- GLOBAL ERROR HANDLER ---");
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
  
    const statusCode = err.statusCode || 500;
    const errorMessage = err.expose ? err.message : 'An internal server error occurred.';
  
    res.status(statusCode).json({
      error: errorMessage,
    });
};
  
export default globalErrorHandler;
