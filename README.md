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

The dataset and an ipython notebook in this repo is used to plot/explore it.
You can look at it/play around with it via jupyter notebook or via collab online:
https://colab.research.google.com/github/hrtlacek/rtv/blob/master/notebook/compareEnvs.ipynb

### What do these Vague Categories Mean?
These are categories that are meant to characterize the purpose a specific tool is used best for. It is of course a bit weird to say environment x has a science score of 0.6. But there is some thought behind this:

#### Science
An environments get a high score for this category if the following is true:
- It is often or sometimes used in a science context
- It is advertised as being a good tool for research
- it is open source
- It has some text programming capabilities
- Its files are not stored as binary (but as JSON for example) and general openness
- It's highly extensible
- support for computer-vision
- linux support

#### Creativity
An environments get a high score for this category if the following is true:
- It is often or sometimes used in an art context
- It is advertised as being a good tool for design
- It's beginner and artist friendly and does not need a lot of know-how of inner workings
- It's design-centered
- Ease of use is an obvious priority of the environment (technical things are not in the way)
- Reinventing the wheel is nearly not necessary
- It supports some kind of graphical programming environment(not only text programming)
- has built-in out-of-the-box 3d viewports (such as smode, notch, touchDesigner)
- Offers 'fancy' output out-of-the-box, without tweaking a lot (anti-aliasing etc)

#### Show Production
An environments get a high score for this category if the following is true:
- It is often or sometimes used in a professional Live-Show/Set-design context
- It is advertised as being a good tool for professional large-scale live shows
- It offers great out-of-the-box integration of current technology(Kinect, NDI, Dante, posiStage)
- Extremely stable
- out-of-the-box 2D/3D  Mapping capabilities
- Good interfaces to other professional software that is widely used (Substance Designer, Photoshop, various 3d Modelling Tools etc)
- DMX/Artnet support out-of-the-box
- It has some kind of Linear/Keyframing (time line) functionality

#### Experimental
An environments get a high score for this category if the following is true:
- It is often or sometimes used in an experimental/art context
- It is advertised as being a good tool for art based research
- It's open source
- It supports current technologies such as HIDs and VR
- It's highly extensible
- It's not very specialized or very specialized on a not so common technique (such as live coding)
- It's not extremely expensive
- linux support
- built-in support for computer-vision

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



