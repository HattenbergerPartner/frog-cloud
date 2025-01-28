# Frog Cloud

Frog Cloud is a Docker-based service for running and managing Screaming Frog on remote servers. Frog Cloud includes a front end for requesting new crawls, monitoring crawl progress, downloading reports from completed crawls, and managing Screaming Frog configuration files and settings.

## Getting Started

You can run Frog Cloud locally or deploy to popular hosting services such as AWS, DigitalOcean, GCP, or any other service that supports Docker.

Run `docker-compose up --build` to set up the various services and start each container. Once all services have been built you can open the `manager` app and configure your instance.

![Frog Cloud Manager app](https://github.com/myawesomebike/frog-cloud/raw/main/img/getting-started.png)

### ScreamingFrog Configuration

Before you can start crawling you'll need to add your ScreamingFrog license information and configure ScreamingFrog memory settings based on the environment you're using. You can also upload ScreamingFrog configuration files that you've exported from the desktop version of ScreamingFrog.'

![Frog Cloud settings](https://github.com/myawesomebike/frog-cloud/raw/main/img/settings.png)

### Starting a Crawl

Once you've configured your Frog Cloud instance you can request a new crawl (http://localhost:3000/crawl). Enter the starting URL, select any custom configurations you've uploaded, and select the reports you'd like to export.

![Frog Cloud crawling](https://github.com/myawesomebike/frog-cloud/raw/main/img/crawling.png)

## How Does Frog Cloud Work?

Frog Cloud uses Flask, Celery, and Redis to schedule and run ScreamingFrog in headless mode. Also included is a React front-end for configuring ScreamingFrog, creating crawls, and viewing crawl progress and reports.

## SFaaS API (Screaming Frog as a Service Application Programming Interface)

The `scheduler` service exposes an API on port `5000` for  requesting a new crawl, monitoring crawl progress, and downloading ScreamingFrog reports and exported data. These APIs can be utilized programmatically for monitoring, alerting, and general crawling workflows in your project. While many crawling libraries already exist for Python and other popular languages, Frog Cloud can function as a deployable crawling service.

### Managing Crawls

The `scheduler` service exposes an API on port `5000` for requesting a new crawl, checking the status of a crawl, and canceling crawls.

#### New Crawl
To start a crawl send a request with the starting URL. Include any optional reports you'd like to capture and pass the config ID for the specific crawler configuration you'd like to use (see config section).

##### POST Request
    /crawl
    {
        requestURL: 'example.com', //string, required
        requestReports: ['internal'], //list of strings
        configId: 'f42avg2', //string
      }
##### Return

    {
         status: 'ok', //string
         task: '123asd32', //unique task ID
         refreshURL: '/checktask', //Celery task status
    }
You can use the task ID to check the crawl status or cancel the crawl if it isn't complete.

#### Crawl Status
To start a crawl send a request with the starting URL. Include any optional reports you'd like to capture and pass the config ID for the specific crawler configuration you'd like to use (see config section).

##### POST Request
    /status
    {
        task_id: '123asd32', //string, required
      }
##### Return

    {
         id: '32', //internal ID
         task_id: '123asd32', //unique task ID
         status: 'ok', //string
         start_url: 'example.com', //requested starting URL
         start_time: '12320223', //crawl start timestamp
         end_time: '12320232', //crawl end timestamp
         report_data: ['/tsk/123.csv'], //list of report URLs
    }
The status endpoint will return live information about a crawl as well as completed crawls.

#### Cancel Crawl
To cancel a crawl send a request with the `task_id`.

##### POST Request
    /status
    {
        task_id: '123asd32', //string, required
      }
##### Return

    {
         status: 'ok', //string
         task_id: '123asd32', //unique task ID
         state: 'CANCELED',
    }

---
Other endpoints are available for managing configuration files and checking instance configuration.

## Frog Cloud FAQs

### Why Run Screaming Frog in the Cloud?

Cloud VMs can be scaled as needed to support very large site crawls and data capture/export. Frog Cloud can be deployed as an API-driven crawling service within your apps and organization.

### What does Frog Cloud Do?

Frog Cloud includes a UI for configuring and managing Screaming Frog crawls and Celery-based tasking for scheduling and running crawls. The Docker services can be deployed in popular cloud providers for manageable costs on trusted machines and IPs and proxies. Crawls can be scheduled as needed without using resources on local machines for consistent and predictable crawls.

### Can't I just run Screaming Frog on my computer?

Yes, and the newer versions of Screaming Frog support scheduling - but you'll need to make sure your computer is available during scheduled crawls to avoid missing or delaying a crawl. Frog Cloud is designed for on-going site monitoring, data extraction, and other 'automated' crawling needs. Frog Cloud can use Screaming Frog's built-in integrations (such as Google Analytics and AI) - but the Docker-based Python-backed services are easy to customize, extend, and integrate with other complex data workflows.

## Modifying and Extending Frog Cloud

This package includes developer instances for customizing and extending Frog Cloud.

Run `docker compose --profile dev up` (include the `--build` flag on first run).

- React development server (`localhost:3000`)
- Celery Flower monitor (`localhost:5555`)

### Deployment and Orchestration
Frog Cloud services can be easily configured for deployment and orchestration via services such as Kubernetes or Docker Swarm.
