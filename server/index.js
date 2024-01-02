const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { db } = require("./db");
require("dotenv").config();

const {
	createIssue,
	getIssueID,
	getTsrcID,
	getGitHubPullRequest,
	mergeGitHubPullRequest,
	closeGitHubPullRequest,
	checkGitHubAccessTokenPermissions,
	verify,
	createGitHubPullRequest,
	createGitHubRepoFork,
} = require("../lib");

var schema = buildSchema(`

type Res {
  status: Int!
  tsrcID: String!
  issueID: String!
  message: String!
}

type Repo {
	git_url: String!
}

type GitHubPullRequestHead {
  label: String!
  ref: String!
  sha: String!
  repo: Repo!
}

type GitHubPullRequestBase {
  label: String!
  ref: String!
  sha: String!
}

type GitHubPullRequest {
  status: Int!
  message: String!
  issue_url: String!
  number: Int!
  state: String!
  title: String!
  head: GitHubPullRequestHead!
  base: GitHubPullRequestBase!
  merged: Boolean!
  mergeable: Boolean!
}

type Permissions {
  status: Int!
  message: String!
  public_repo_scopes: Boolean!
  push_permissions: Boolean!
}

type Verify {
	status: Int!
	verified: Boolean!
	message: String!
  }

type BasicRes {
	status: Int!
	message: String!
  }

  type Query {
    createIssue(repo: String, issue_id: String, tsrc_id: String): Res,
    getIssueID(repo: String, tsrc_id: String,): Res,
    getTsrcID(repo: String, issue_id: String): Res,
    getGitHubPullRequest(owner: String, repo: String, pull: Int, accessToken: String): GitHubPullRequest,
    mergeGitHubPullRequest(owner: String, repo: String, pull: Int, accessToken: String): Res,
    closeGitHubPullRequest(owner: String, repo: String, pull: Int, accessToken: String): Res,
    checkGitHubAccessTokenPermissions(owner: String, repo: String, accessToken: String, contributorName: String, instanceToken: String): Permissions,
	verify(contributorName: String, token: String): Verify,
	createGitHubPullRequest(owner: String, repo: String, title: String, body: String, forkBranch: String, base: String, accessToken: String): BasicRes,
	createGitHubRepoFork(owner: String, repo: String, organization: String, name: String, defaultBranchOnly: Boolean, accessToken: String): BasicRes,
}
`);

var root = {
	createIssue: async (args) => {
		return await createIssue(args.repo, args.issue_id, args.tsrc_id);
	},
	getIssueID: async (args) => {
		return (issueID = await getIssueID(args.repo, args.tsrc_id));
	},
	getTsrcID: async (args) => {
		return await getTsrcID(args.repo, args.issue_id);
	},
	getGitHubPullRequest: async (args) => {
		return await getGitHubPullRequest(
			args.owner,
			args.repo,
			args.pull,
			args.accessToken
		);
	},
	mergeGitHubPullRequest: async (args) => {
		return await mergeGitHubPullRequest(
			args.owner,
			args.repo,
			args.pull,
			args.accessToken
		);
	},
	closeGitHubPullRequest: async (args) => {
		return await closeGitHubPullRequest(
			args.owner,
			args.repo,
			args.pull,
			args.accessToken
		);
	},
	checkGitHubAccessTokenPermissions: async (args) => {
		const res = await checkGitHubAccessTokenPermissions(
			args.owner,
			args.repo,
			args.accessToken,
			args.contributorName,
			args.instanceToken
		);
		return res;
	},
	verify: async (args) => {
		const res = await verify(args.contributorName, args.token);
		return res;
	},
	createGitHubPullRequest: async (args) => {
		const res = await createkGitHubPullcreateGitHubPullRequest(
			args.owner,
			args.repo,
			args.title,
			args.body,
			args.forkBranch,
			args.base,
			args.accessToken
		);
		return res;
	},
	createGitHubRepoFork: async (args) => {
		const res = await createkGitHubPullcreateGitHubRepoFork(
			args.owner,
			args.repo,
			args.organization,
			args.name,
			args.defaultBranchOnly,
			args.accessToken
		);
		return res;
	},
};

const port = process.env.PORT || 4004;

const app = express();

app.listen(port);
console.log(
	`Namespace Server: Running a GraphQL API server on port ${port}/graphql`
);

app.use(
	"/graphql",
	graphqlHTTP({
		schema: schema,
		rootValue: root,
		graphiql: true,
	})
);

try {
	//Will delete data delete data from db on npm start:
	db.sync({ force: true });

	//Will not delete data from db on npm start:
	// db.sync();

	db.authenticate();
	console.log(
		"Connection to the Postgres database has been established successfully."
	);
} catch (error) {
	console.error("Unable to connect to the Postgres database:", error);
}
