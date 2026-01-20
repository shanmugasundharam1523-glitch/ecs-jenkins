pipeline {
    agent any

    environment {
        FUNCTION_NAME = "jenkins-backend"
        AWS_DEFAULT_REGION = "ap-south-1"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Package Lambda') {
            steps {
                sh '''
                echo "PWD:"
                pwd

                echo "Files in workspace:"
                ls -l

                echo "Zipping everything..."
                zip -r function.zip .

                echo "Zip file details:"
                ls -lh function.zip
                '''
            }
        }

        stage('Deploy Lambda') {
            steps {
                sh '''
                aws lambda update-function-code \
                  --function-name $FUNCTION_NAME \
                  --zip-file fileb://function.zip
                '''
            }
        }
    }
}
