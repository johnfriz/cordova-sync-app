
node("android") {
    stage("Checkout") {
        checkout scm
    }

    stage("Prepare") {
        sh 'npm install'
    }

    stage("Build") {
        sh './node_modules/.bin/ionic cordova build android --dev'
    }

    stage("Archive") {
        archiveArtifacts artifacts: "platforms/android/build/outputs/apk/android-debug.apk"
    }
}
