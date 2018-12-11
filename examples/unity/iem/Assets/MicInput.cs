using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;



public class MicInput : MonoBehaviour {

    //output mic loudness
    public float MicLoudness;
    float MicLoudnessInDB;
    public float maxMicInputVolume;
    public float objectScaleMin;
    public float objectScaleMax;

    private Vector3 scale;

    //if you have more then one microphone attached
    private string _device;

    //AudioClip to temporary store our microphone input
    AudioClip _clipRecord;
    // samplerate of the audioclip
    private int samplerate = 44100;


    int _sampleWindow = 128;

    //is the microphone initialized
    bool _isInitialized;


    void Update() {
        // levelMax equals to the highest normalized value power 2, a small number because < 1
        MicLoudnessInDB = LinearToDecibel(LevelMax());
        MicLoudness = LevelMax();

        //scale gameobject
        float scaleValue = map(MicLoudness, 0, maxMicInputVolume, objectScaleMin, objectScaleMax);
        scale.x = scaleValue;
        scale.y = scaleValue;
        scale.z = scaleValue;
        gameObject.transform.localScale = scale;

    }

    //mic initialization and start recording
    void InitMic() {
        //use the first microphone connected
        if (_device == null)
            _device = Microphone.devices[0];

        //start recording 999 seconds
        _clipRecord = Microphone.Start(_device, true, 999, 44100);
    }

    void StopMicrophone() {
        Microphone.End(_device);
    }

    //get data from microphone into audioclip and returns the volume
    float LevelMax() {
        float levelMax = 0;
        float average = 0;
        float[] waveData = new float[_sampleWindow];
        int micPosition = Microphone.GetPosition(null) - (_sampleWindow + 1); // null means the first microphone

        if (micPosition < 0)
            return 0;

        _clipRecord.GetData(waveData, micPosition);

        // Getting a peak on the last 128 samples
        // Getting average on the last 128 samples
        for (int i = 0; i < _sampleWindow; i++) {
            float wavePeak = waveData[i] * waveData[i];
            if (levelMax < wavePeak) {
                levelMax = wavePeak;
            }
            average += waveData[i] * waveData[i];
        }
        //return average / _sampleWindow;
        return levelMax;

    }

    //convert from linear input to decibel
    private float LinearToDecibel(float linear) {
        float dB;

        //linear != 0: epsilon comparison
        if (linear >= Double.Epsilon)
            dB = 20.0f * Mathf.Log10(linear);
        else
            dB = -144.0f;

        return dB;
    }

    float map(float value, float istart, float iend, float ostart, float oend) {
        return ostart + (oend - ostart) * ((value - istart) / (iend - istart));
    }

    // start mic when scene starts
    void OnEnable() {
        InitMic();
        _isInitialized = true;
    }

    //stop mic when loading a new level or quit application
    void OnDisable() {
        StopMicrophone();
    }

    void OnDestroy() {
        StopMicrophone();
    }


    // make sure the mic gets started & stopped when application gets focused
    void OnApplicationFocus(bool focus) {
        if (focus) {

            if (!_isInitialized) {
                InitMic();
                _isInitialized = true;
            }
        }
        if (!focus) {
            StopMicrophone();
            _isInitialized = false;

        }
    }
}
