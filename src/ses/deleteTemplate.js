var params = {
  TemplateName: 'STRING_VALUE' /* required */
};
ses.deleteTemplate(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
