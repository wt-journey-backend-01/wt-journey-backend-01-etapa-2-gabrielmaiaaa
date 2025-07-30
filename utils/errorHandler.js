function handleError(status, message, tipo, errorMessage) {
    const error = {
        "status": status,
        "message": message,
        "errors": {
            [tipo]: errorMessage
        }
    };

    console.log(error);

    return error;
}

module.exports = {
    handleError
};