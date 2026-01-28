pipeline {
  agent any

  environment {
    AWS_REGION = "ap-south-1"
    AWS_ACCOUNT_ID = "204107104458"
    ECR_REPO = "204107104458.dkr.ecr.ap-south-1.amazonaws.com/backend-app"
    EKS_CLUSTER = "my-eks-cluster"
    IMAGE_TAG = "latest"
  }

  stages {

    stage("Checkout Code") {
      steps {
        checkout scm
      }
    }

    stage("Docker Check") {
      steps {
        sh '''
          docker version
        '''
      }
    }

    stage("Build Docker Image") {
      steps {
        sh '''
          docker build -t backend-app .
          docker tag backend-app:latest $ECR_REPO:$IMAGE_TAG
        '''
      }
    }

    stage("Login to ECR") {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                          credentialsId: 'aws-ecr-ecs-creds']]) {
          sh '''
            aws ecr get-login-password --region $AWS_REGION \
            | docker login --username AWS --password-stdin $ECR_REPO
          '''
        }
      }
    }

    stage("Push Image to ECR") {
      steps {
        sh '''
          docker push $ECR_REPO:$IMAGE_TAG
        '''
      }
    }

    stage("Configure kubeconfig") {
      steps {
        sh '''
          mkdir -p ~/.kube
          aws eks update-kubeconfig \
            --region $AWS_REGION \
            --name $EKS_CLUSTER
        '''
      }
    }

    stage("Verify EKS Access") {
      steps {
        sh '''
          kubectl get nodes
        '''
      }
    }

    stage("Deploy to EKS") {
      steps {
        sh '''
          kubectl apply -f k8s/
          kubectl rollout status deployment/backend
        '''
      }
    }

    stage("Verify Deployment") {
      steps {
        sh '''
          kubectl get pods
          kubectl get svc
        '''
      }
    }
  }

  post {
    success {
      echo "✅ EKS Deployment Successful!"
    }
    failure {
      echo "❌ Pipeline Failed. Check logs."
    }
    always {
      sh "docker image prune -f || true"
