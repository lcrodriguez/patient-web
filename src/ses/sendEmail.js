// Create sendEmail params 
var params = {
    Destination: { /* required */
      CcAddresses: [
        'leonardo.rodriguez@nybblegroup.com',
        /* more items */
      ],
      ToAddresses: [
        'leonardo.rodriguez@nybblegroup.com',
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
         Charset: "UTF-8",
         Data: "HTML_FORMAT_BODY"
        },
        Text: {
         Charset: "UTF-8",
         Data: "TEXT_FORMAT_BODY"
        }
       },
       Subject: {
        Charset: 'UTF-8',
        Data: 'Test email' + password
       }
      },
    Source: 'daniel.avila@nybblegroup.com ', /* required */
    ReplyToAddresses: [
       'leonardo.rodriguez@nybblegroup.com' ,
      /* more items */
    ],
  };
             
  // Create the promise and SES service object
  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
  
 // Handle promise's fulfilled/rejected states
  sendPromise.then(
    function(data) {
      console.log(data.MessageId);
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });