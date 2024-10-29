const AWS = require('aws-sdk');
const SES = new AWS.SES(); //simple email service

module.exports.sendEmail = (receiverAddresses, htmlContent, textContent, subject, senderAddress, configurationName) => {
  const params = {
    Destination: {
      ToAddresses: receiverAddresses,
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: htmlContent,
        },
        Text: {
          Charset: 'UTF-8',
          Data: textContent,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    ConfigurationSetName: configurationName,
    Source: senderAddress,
  };
  // Create and return a promise of sending an email
  return SES.sendEmail(params).promise();
};

function buildEndpointErrorEmailText(endpointName, errorMessage, callParams) {
  const currentDate = new Date().toString();
  let emailTextContent = `${currentDate}: ${endpointName} endpoint call failed with error: ${errorMessage}\n`;

  // display additional call parameters such as request body parameters, header parameters etc.
  let callParamsStr = '';
  for (const callParamsKey in callParams) {
    const parameterValue = callParams[callParamsKey];
    callParamsStr += `${callParamsKey}: ${parameterValue}\n`;
  }
  emailTextContent += `The call parameters were:\n${callParamsStr}`;

  return emailTextContent;
}

function buildEndpointErrorEmailHtml(endpointName, errorMessage, callParams) {
  const currentDate = new Date().toString();
  let htmlBody = `<p>${currentDate}: <b>${endpointName}</b> endpoint call failed with error:</p>
                  <h3><i>${errorMessage}</i></h3>`;
  // display additional call parameters such as request body parameters, header parameters etc.
  let callParamsHtml = '';
  for (const callParamsKey in callParams) {
    const parameterValue = callParams[callParamsKey];
    callParamsHtml += `<li>${callParamsKey}: ${parameterValue}</li>`;
  }

  htmlBody += `<p>The call parameters were:</p><ul>${callParamsHtml}</ul>`;
  return htmlBody;
}

module.exports.sendEndpointErrorEmail = function (
  endpointName,
  errorMessage,
  callParams,
  receiverAddresses = process.env.ERROR_EMAIL_RECEIVERS,
  senderAddress = process.env.ERROR_EMAIL_SENDER,
  configurationName = process.env.ERROR_EMAIL_CONFIGURATION
) {
  const emailSubject = `${endpointName} endpoint error`;

  const emailBodyText = buildEndpointErrorEmailText(endpointName, errorMessage, callParams);
  const emailBodyHtml = buildEndpointErrorEmailHtml(endpointName, errorMessage, callParams);

  const emailReceivers = receiverAddresses.split(';'); //receiverAddresses is a string with ; separators, so we split it to get an array

  return this.sendEmail(emailReceivers, emailBodyHtml, emailBodyText, emailSubject, senderAddress, configurationName);
};

//for regular (successful) endpoint calls tracking
module.exports.sendEndpointCallEmail = function (
  endpointName,
  callParams,
  receiverAddresses = process.env.ERROR_EMAIL_RECEIVERS,
  senderAddress = process.env.ERROR_EMAIL_SENDER,
  configurationName = process.env.ERROR_EMAIL_CONFIGURATION
) {
  const emailSubject = `${endpointName} endpoint call`;

  const emailBodyText = buildEndpointCallEmailText(endpointName, callParams);
  const emailBodyHtml = buildEndpointCallEmailHtml(endpointName, callParams);

  const emailReceivers = receiverAddresses.split(';'); //receiverAddresses is a string with ; separators, so we split it to get an array

  return this.sendEmail(emailReceivers, emailBodyHtml, emailBodyText, emailSubject, senderAddress, configurationName);
};

function buildEndpointCallEmailText(endpointName, callParams) {
  const currentDate = new Date().toString();
  let emailTextContent = `${currentDate}: ${endpointName} endpoint was successfully called with following parameters:\n`;

  // display additional call parameters such as request body parameters, header parameters etc.
  let callParamsStr = '';
  for (const callParamsKey in callParams) {
    const parameterValue = callParams[callParamsKey];
    callParamsStr += `${callParamsKey}: ${parameterValue}\n`;
  }
  emailTextContent += callParams;

  return emailTextContent;
}

function buildEndpointCallEmailHtml(endpointName, callParams) {
  const currentDate = new Date().toString();
  let htmlBody = `<p>${currentDate}: <b>${endpointName}</b> endpoint was successfully called with following parameters:</p>`;

  // display additional call parameters such as request body parameters, header parameters etc.
  let callParamsHtml = '';
  for (const callParamsKey in callParams) {
    const parameterValue = callParams[callParamsKey];
    callParamsHtml += `<li>${callParamsKey}: ${parameterValue}</li>`;
  }

  htmlBody += `<ul>${callParamsHtml}</ul>`;
  return htmlBody;
}
