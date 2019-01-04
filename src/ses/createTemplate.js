
const keys = config.aws_keys;
AWS.config.update({ ...keys, region: "us-east-1" });

const ses = new AWS.SES();
const params = {
    Template: { /* required */
      TemplateName:'W_Template_test1',
      SubjectPart: 'Lyme Patient, Protocol Code',
      HtmlPart: template
    }
  };

  export default ses.createTemplate(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data);           // successful response
  });
