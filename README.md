# Real Time Visual Content Creation - Overview and Comparison

This Repository tries to compile information about programmable real time video processing environments.

Not included are environments that are so broad that one could do just about everything (like C++) or complete tools without the need or possibility to program anything(or very little, such as resolume).

*Discliamer*: The author of this document is basically a TouchDesigner/Max/python/GLSL guy doing live performances and installations in an art context. Any bias towards these tools/needs are tried to be avoided but probably inevitable.

## Examples
The examples directory is supposed to hold a highly simplistic example for the specific language.
This example should play back an audio file or use live audio input and use this data to somehow (RMS, FFT) modulate the scale of a simplistic 3d object (Sphere, cube) that is rendered.

## Environments
### Short List
Environments listed here are headed towards creation and/or manipulation of real-time video content as a big part of their whole purpose. Environments excluded here are tools that arguably have a different purpose as a whole. Also excluded are unreleased, unstable or outdated environments.

- cinder https://www.libcinder.org/
- fugio https://www.bigfug.com/software/fugio/
- hydra https://github.com/ojack/hydra?fbclid=IwAR0ZJDLSSqnpiFc4_eIyo4lDPHVj31Tv5qKYLLBq-nlfUdI6zX9evy7H7s4
- isadora https://troikatronix.com/
- KodeLife https://hexler.net/software/kodelife
- Max/MSP/Jitter https://cycling74.com/
- notch https://www.notch.one/
- openFrameworks https://openframeworks.cc/
- pd/ofelia https://github.com/cuinjune/ofxOfelia
- PraxisLIVE https://www.praxislive.org
- Processing https://processing.org/
- smode http://smode.fr/products/
- tooll http://tooll.io/
- TouchDesigner https://www.derivative.ca/
- Unity https://unity3d.com/
- Unreal Engine https://www.unrealengine.com
- ventuz https://www.ventuz.com/
- vuo https://vuo.org/
- vvvv https://vvvv.org/
- vvvvjs http://vvvvjs.com/

### Unreleased/Beta/coming Soon
- cables.gl https://cables.gl/
- flaretic http://www.flaretic.com/
- wire https://www.moditone.com/wire

### Outdated
- Quarz Composer https://developer.apple.com/library/archive/documentation/GraphicsImaging/Conceptual/QuartzComposerUserGuide/qc_intro/qc_intro.html
- pd/GEM https://puredata.info/downloads/gem

### Scientific Data Viz and preprocessing
tools for scientific visualization, neural network video stuff and data parsing
- MATLAB https://www.mathworks.com/products/matlab.html
- Python https://www.python.org/

### Other
Realted tools and tools I don't know much about.
- vizrt http://www.vizrt.com/
- watchout https://www.dataton.com/products/watchout
- lightact https://lightact-systems.com/

### pure GLSL/HLSL coding environments
There are several tools that make (live-)coding in GLSL/HLSL easier/more interesting/convenient or make coding of GLSL relevant in a live show context. Trying to list all of them is not the idea here. But it's probably important to mention their existence/relevance as a whole.
- Veda (live glsl coding plugin for atom) https://atom.io/packages/veda?fbclid=IwAR0OHui3eTsAEYNLOpKYMNfrPIsr5AXMyCyBndvVcCzEwVtGH1D4qZ7HLFM
- glslViewer (glsl viewer plugin for sublime text) https://packagecontrol.io/packages/glslViewer
- shadertoy http://shadertoy.com/

## Evaluation
This repo also tries to evaluate the different environments numerically. Please take these numbers with a grain of salt. What does it mean that tool x has a documentation with a value of 0.7568? and not 0.879?
Well, it is an attempt to structure the wood of environments but it is of course a bit hard to evaluate some parameters. Others, such as 'does environment x run on Linux' are of course objective and trustworthy.

The dataset is located in this repository and a colab notebook that plots teh data is located here for now:
https://colab.research.google.com/drive/18XNz7i0OoGwXYcB1Ts6XVH0Dfg1ZioKD

![3D plot](https://raw.githubusercontent.com/hrtlacek/rtv/dev/img/compare3d.png)

<!--
### Notch
- very powerful
#### Concepts
- Timeline
- Node based
- Toplogy of Nodelayout affects function
Notch founder Talk: https://www.youtube.com/watch?v=YmaTrYjowqo&list=PLKPdnr8oxs8glsn3EOCKtuXT9sDXnqS3M
 -->



