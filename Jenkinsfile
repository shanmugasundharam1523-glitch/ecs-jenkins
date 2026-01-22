pipeline {
  agent any

  environment {
    AWS_REGION   = "ap-south-1"
    ECR_REPO     = "204107104458.dkr.ecr.ap-south-1.amazonaws.com/backend-app"
    CLUSTER_NAME = "ecs-backend-cluster"
    SERVICE_NAME = "ecs-backend-service"
    TASK_FAMILY  = "ecs-backend-task"
    CONTAINER_NAME = "ecs-backend-container"
    IMAGE_TAG    = "${BUILD_NUMBER}"
  }

  stages {

    stage("Checkout Code") {
      steps {
        checkout scm
      }
    }

    stage("Build Docker Image") {
      steps {
        sh """
          docker build -t ${ECR_REPO}:${IMAGE_TAG} .
        """
      }
    }

    stage("Login to ECR") {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                          credentialsId: 'aws-ecr-ecs-creds']]) {
          sh """
            aws ecr get-login-password --region ${AWS_REGION} \
            | docker login --username AWS --password-stdin ${ECR_REPO}
          """
        }
      }
    }

    stage("Push Image to ECR") {
      steps {
        sh """
          docker push ${ECR_REPO}:${IMAGE_TAG}
        """
      }
    }

    stage("Register New Task Definition") {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                          credentialsId: 'aws-ecr-ecs-creds']]) {
          sh """
            aws ecs describe-task-definition \
              --task-definition ${TASK_FAMILY} \
              --region ${AWS_REGION} \
              --query taskDefinition \
            | jq 'del(
                .taskDefinitionArn,
                .revision,
                .status,
                .requiresAttributes,
                .compatibilities,
                .registeredAt,
                .registeredBy
              )
              | .containerDefinitions[0].image = "${ECR_REPO}:${IMAGE_TAG}"' \
            > new-task-def.json

            aws ecs register-task-definition \
              --cli-input-json file://new-task-def.json \
              --region ${AWS_REGION}
          """
        }
      }
    }

    stage("Deploy to ECS") {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                          credentialsId: 'aws-ecr-ecs-creds']]) {
          sh """
            aws ecs update-service \
              --cluster ${CLUSTER_NAME} \
              --service ${SERVICE_NAME} \
              --task-definition ${TASK_FAMILY} \
              --region ${AWS_REGION} \
              --force-new-deployment
          """
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deployment successful! Image tag: ${IMAGE_TAG}"
    }
    failure {
      echo "❌ Deployment failed. Check logs."
    }
    always {
      sh "docker image prune -f || true"
    }
  }
}
