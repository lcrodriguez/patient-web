import template from './protocolTemplate';
import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';
import config from '../../config';

const keys = config.aws_keys;
AWS.config.update({ ...keys, region: "us-east-1" });

const ses = new AWS.SES();
const params = {
    Template: { /* required */
      TemplateName:'Lyme_Protocol_Template',
      SubjectPart: 'Lyme Patient Protocol',
      HtmlPart: template
    }
  };

  export default ses.createTemplate(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data);           // successful response
  });
