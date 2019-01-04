              var templatePromise = new AWS.SES({apiVersion: '2010-12-01'}).getTemplate({TemplateName: 'Lyme_Template'}).promise();


                    var params = {
                        Destination: { /* required */
                          CcAddresses: [
                            'daniel.avila@nybblegroup.com',
                            /* more CC email addresses */
                          ],
                          ToAddresses: [
                            'daniel.avila@nybblegroup.com',
                      
                            /* more To email addresses */
                          ]
                        },
                        Source: 'daniel.avila@nybblegroup.com', /* required */
                        Template: 'Lyme_Template3' , /* required */
                    
                    //    TemplateData: '{ \"name\":\"name\" ,\"password\":\"password\" }', /* required */

                        TemplateData: '{ \"name\":\"'+name+'\" ,\"password\":\"'+password+'\" }', 
                        ReplyToAddresses: [
                          'daniel.avila@nybblegroup.com'
                        ],
                      };
                      var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

                      // Handle promise's fulfilled/rejected states
                      sendPromise.then(
                        function(data) {
                          console.log(data);
                        }).catch(
                          function(err) {
                          console.error(err, err.stack);
                        });