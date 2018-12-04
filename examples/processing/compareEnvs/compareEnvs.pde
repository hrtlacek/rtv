// references:
// https://processing.org/tutorials/p3d/
// https://processing.org/tutorials/sound/

import processing.sound.*;

// Declare the processing sound variables 
SoundFile sample;
Amplitude rms;

// Declare a scaling factor
float scale = 5.0;

// Declare a smooth factor
float smoothFactor = 0.25;

// Used for smoothing
float sum;


float x,y,z;

void setup() {
  size(200,200,P3D);
  x = width/2;
  y = height/2;
  z = 0;
  
  //------Sound related-------:
  //change the path to point to an audio file on your disk!
  sample = new SoundFile(this, "../../_audio/drumloop.wav");
  sample.loop();

  // Create and patch the rms tracker
  rms = new Amplitude(this);
  rms.input(sample);

}

void draw() {
  
  // Smooth the rms data by smoothing factor
  sum += (rms.analyze() - sum) * smoothFactor; 
  
  // rms.analyze() return a value between 0 and 1. It's
  // scaled to height/2 and then multiplied by a scale factor
  float rmsScaled = sum * (height/2) * scale;
  
  
  background(0);
  directionalLight(255,255,255,1,1,0);
  translate(x,y,z);
  noStroke();
  sphere(rmsScaled*0.5);
  //rectMode(CENTER);
  //rect(0,0,100,100);

}
