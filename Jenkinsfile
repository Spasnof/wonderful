/* Requires the Docker Pipeline plugin */
node('docker') {
    checkout scm
    stage('test') {
        bat 'python --version'
        }
    }
}

