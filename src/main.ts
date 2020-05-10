import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const token = (core.getInput('github_token') ||
      process.env.GITHUB_TOKEN) as string

    const octokit = new github.GitHub(token)
    const context = github.context

    const deployment_id = parseInt(core.getInput('deployment_id'), 10)
    const description = core.getInput('description')
    const state = core.getInput('state') as
      | 'error'
      | 'failure'
      | 'inactive'
      | 'in_progress'
      | 'queued'
      | 'pending'
      | 'success'
    const log_url = core.getInput('log_url') || undefined
    const environment = (core.getInput('environment') || undefined) as
      | 'production'
      | 'staging'
      | 'qa'
      | undefined
    const environment_url = core.getInput('environment_url') || undefined
    const auto_inactive = core.getInput('auto_inactive') === 'true'

    const request = await octokit.repos.createDeploymentStatus({
      ...context.repo,
      deployment_id,
      state,
      description,
      log_url,
      environment,
      environment_url,
      auto_inactive,
      mediaType: {
        previews: [
          'ant-man-preview', // https://developer.github.com/v3/previews/#enhanced-deployments
          'flash-preview' // https://developer.github.com/v3/previews/#deployment-statuses
        ]
      }
    })

    const deploymentStatus = request.data
    core.setOutput('deployment_status_id', deploymentStatus.id.toString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
