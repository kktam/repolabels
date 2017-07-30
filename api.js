const API = require('claudia-api-builder'),
      TimeAgo = require('time-ago'),
      numeral = require('numeral'),
      got = require('got'),
      fs = require('fs-promise'),
      api = new API(),
      formatter = new TimeAgo();

module.exports = api;

/*
 * Get Github repository graph data
 */
let getRepoDetails = function (owner, repo, env) {
    var appAuthorization = '';
    var url = '';
    if (env && env.githubClientId && env.githubSecret) {
        appAuthorization = '?client_id=' + env.githubClientId + '&client_secret=' + env.githubSecret;
    }
    console.log(url);
    url = 'https://api.github.com/repos/' + owner + '/' + repo + appAuthorization;
    return got(url).then(function (response) {
        return JSON.parse(response.body);
    });
};

/*
 * Format large number formatting for numerals
 */
var fmt = function (number) {
    if (number > 999 && number < 100000) {
        return '0.0a';
    }
    return '0a';
}

/*
 * Format numbers for display
 */
var numeralFormat = function (number) {
    return numeral(number).format(fmt(number));
}

/*
 * Get Github Repo statistics in SVG image
 */
api.get('{owner}/{repo}/{template}', function (request) {
    var owner = request.pathParams.owner;
    var repo = request.pathParams.repo;
    var templateName = request.pathParams.template;
    if (!owner) {
        return 'Please provide a valid Github owner name, the name provided is ' + request.pathParams.owner;
    }
    if (!repo) {
        return 'Please provide a valid Github repository name, the name provided is ' + request.pathParams.repo;
    }
    if (!templateName) {
        templateName = 'large';
    }    
    var template;
    return fs.readFile('svg/' + templateName + '.svg', 'utf8').then(function (contents) {
        template = contents;
    }).then(function () {
        return getRepoDetails(owner, repo, request.env);
    }).then(function (repoDetails){
        var displayName = repoDetails.full_name.length <= 20 ? repoDetails.full_name: repoDetails.name;
        var replacements = {
            name: displayName,
            forks: numeralFormat(repoDetails.forks_count),
            stars: numeralFormat(repoDetails.stargazers_count),
            created: formatter.ago(repoDetails.created_at),
            updated: formatter.ago(repoDetails.updated_at)
        };
        Object.keys(replacements).forEach(function (key) {
            template = template.replace('(' + key + ')', replacements[key]);
        });
        return template;
    });

    //return 'You asked for ' + request.pathParams.owner + '/' + request.pathParams.repo;
}, { success: { contentType: 'image/svg+xml'}});