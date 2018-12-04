"use strict";

var CABLES=CABLES||{};
CABLES.OPS=CABLES.OPS||{};

var Ops=Ops || {};
Ops.Gl=Ops.Gl || {};
Ops.Api=Ops.Api || {};
Ops.Math=Ops.Math || {};
Ops.Gl.Phong=Ops.Gl.Phong || {};
Ops.WebAudio=Ops.WebAudio || {};
Ops.Gl.Matrix=Ops.Gl.Matrix || {};
Ops.Gl.Meshes=Ops.Gl.Meshes || {};
Ops.Api.SoundCloud=Ops.Api.SoundCloud || {};



// **************************************************************
// 
// Ops.Api.SoundCloud.SoundCloud
// 
// **************************************************************

Ops.Api.SoundCloud.SoundCloud = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var clientId="6f693b837b47b59a17403e79bcff3626";

var soundCloudUrl=op.addInPort(new CABLES.Port(op,"SoundCloud URL",CABLES.OP_PORT_TYPE_VALUE,{type:"string"}));

var streamUrl=op.addOutPort(new CABLES.Port(op,"Stream URL",CABLES.OP_PORT_TYPE_VALUE));
var artworkUrl=op.addOutPort(new CABLES.Port(op,"Artwork URL",CABLES.OP_PORT_TYPE_VALUE));
var title=op.addOutPort(new CABLES.Port(op,"Title",CABLES.OP_PORT_TYPE_VALUE));
var result=op.addOutPort(new CABLES.Port(op,"Result",CABLES.OP_PORT_TYPE_OBJECT));

// soundCloudUrl.ignoreValueSerialize=true;
streamUrl.ignoreValueSerialize=true;
artworkUrl.ignoreValueSerialize=true;
streamUrl.ignoreValueSerialize=true;
title.ignoreValueSerialize=true;
soundCloudUrl.onChange=resolve;

function resolve()
{
    
    console.log(1234,soundCloudUrl.get());
    
    if(soundCloudUrl.get())
        CABLES.ajax(
            'https://api.soundcloud.com/resolve.json?url='+soundCloudUrl.get()+'&client_id='+clientId,
            function(err,_data,xhr)
            {
                var data=JSON.parse(_data);
                streamUrl.set(data.stream_url+"?client_id="+clientId);
                artworkUrl.set(data.artwork_url);
                title.set(data.title);
                console.log('stream url:'+data.stream_url);
                console.log(data);
            });

}


};

Ops.Api.SoundCloud.SoundCloud.prototype = new CABLES.Op();
CABLES.OPS["56eb1fbf-de90-4d64-9ad5-5514cf84440d"]={f:Ops.Api.SoundCloud.SoundCloud,objName:"Ops.Api.SoundCloud.SoundCloud"};




// **************************************************************
// 
// Ops.WebAudio.AudioPlayer
// 
// **************************************************************

Ops.WebAudio.AudioPlayer = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var self = this;
var patch=this.patch;
// todo: audio object: firefox does not support .loop=true
//
// myAudio = new Audio('someSound.ogg'); 
// myAudio.addEventListener('ended', function() {
//     this.currentTime = 0;
//     this.play();
// }, false);
// myAudio.play();




this.name='AudioPlayer';

this.file=op.inFile("file","audio");
var play=op.addInPort(new CABLES.Port(this,"play",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
var autoPlay=op.addInPort(new CABLES.Port(this,"Autoplay",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

var volume=this.addInPort(new CABLES.Port(this,"volume",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var synchronizedPlayer=this.addInPort(new CABLES.Port(this,"Synchronized Player",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

this.audioOut=this.addOutPort(new CABLES.Port(this, "audio out",CABLES.OP_PORT_TYPE_OBJECT));
var outPlaying=this.addOutPort(new CABLES.Port(this, "playing",CABLES.OP_PORT_TYPE_VALUE));
var outEnded=this.addOutPort(new CABLES.Port(this, "ended",CABLES.OP_PORT_TYPE_FUNCTION));


var doLoop=op.addInPort(new CABLES.Port(this,"Loop",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

autoPlay.set(true);
volume.set(1.0);

outPlaying.ignoreValueSerialize=true;
outEnded.ignoreValueSerialize=true;

window.AudioContext = window.AudioContext||window.webkitAudioContext;
if(!window.audioContext) window.audioContext = new AudioContext();

if(!window.audioContext) {
    if(this.patch.config.onError) this.patch.config.onError('sorry, could not initialize WebAudio. Please check if your Browser supports WebAudio');
}

this.filter = audioContext.createGain();
self.audio=null;
var buffer=null;
var playing=false;
outPlaying.set(false);


play.onChange=function()
{
    
    if(!self.audio) 
    {
        op.uiAttr({'error':'No audio file selected'});
        return;
    }
    else op.uiAttr({'error':null});
        

    if(play.get())
    {
        playing=true;
        self.audio.play();
    }
    else
    {
        playing=false;
        self.audio.pause();
    }
    outPlaying.set(playing);
};



this.onDelete=function()
{
    if(self.audio) self.audio.pause();
};


doLoop.onChange=function()
{
    if(self.audio) self.audio.loop=doLoop.get();
    else if(self.media) self.media.loop=doLoop.get();
};

function seek()
{
    // if(!window.gui && CGL.getLoadingStatus()>=1.0)
    // {
    //     console.log('seek canceled',CGL.getLoadingStatus());
    //     return;
    // }

    if(!synchronizedPlayer.get())
    {
        if(!self.audio)return;

        if(self.patch.timer.isPlaying() && self.audio.paused) self.audio.play();
            else if(!self.patch.timer.isPlaying() && !self.audio.paused) self.audio.pause();

        self.audio.currentTime=self.patch.timer.getTime();
    }
    else
    {
        if(buffer===null)return;

        var t=self.patch.timer.getTime();
        if(!isFinite(t))
        {
            return;
            // console.log('not finite time...',t);
            // t=0.0;
        }

        playing=false;

        // console.log('seek.....',self.patch.timer.isPlaying());

        if(self.patch.timer.isPlaying() )
        {
            console.log('play!');
            outPlaying.set(true);

            self.media.start(t);
            playing=true;
        }
    }

}

function playPause()
{
    if(!self.audio)return;
            
    if(self.patch.timer.isPlaying()) self.audio.play();
        else self.audio.pause();
}

function updateVolume()
{
    // self.filter.gain.value=(volume.get() || 0)*op.patch.config.masterVolume;
    self.filter.gain.setValueAtTime((volume.get() || 0) * op.patch.config.masterVolume, window.audioContext.currentTime);
}

volume.onChange=updateVolume;
op.onMasterVolumeChanged=updateVolume;

var firstTime=true;
var loadingFilename='';
this.file.onChange=function()
{
    if(!self.file.get())return;
    loadingFilename=op.patch.getFilePath(self.file.get());
    
    var loadingId=patch.loading.start('audioplayer',self.file.get());


    if(!synchronizedPlayer.get())
    {
        if(self.audio)
        {
            self.audio.pause();
            outPlaying.set(false);
        }
        self.audio = new Audio();

// console.log('load audio',self.file.val);

        self.audio.crossOrigin = "anonymous";
        self.audio.src = op.patch.getFilePath(self.file.get());
        self.audio.loop = doLoop.get();
        self.audio.crossOrigin = "anonymous";

        var canplaythrough=function()
        {
            if(autoPlay.get() || play.get()) self.audio.play();
            outPlaying.set(true);
            patch.loading.finished(loadingId);
            self.audio.removeEventListener('canplaythrough',canplaythrough, false);
        };

        self.audio.addEventListener('canplaythrough',canplaythrough, false);
        
        self.audio.addEventListener('ended',function()
        {
            // console.log('audio player ended...');
            outPlaying.set(false);
            playing=false;
            outEnded.trigger();
        }, false);
        

        self.media = audioContext.createMediaElementSource(self.audio);
        self.media.connect(self.filter);
        self.audioOut.val = self.filter;
    }
    else
    {
        self.media = audioContext.createBufferSource();
        self.media.loop=doLoop.get();

        var request = new XMLHttpRequest();

        request.open( 'GET', op.patch.getFilePath(self.file.get()), true );
        request.responseType = 'arraybuffer';

        request.onload = function()
        {
            var audioData = request.response;

            audioContext.decodeAudioData( audioData, function(res)
            {
                buffer=res;
                // console.log('sound load complete');
                self.media.buffer = res;
                self.media.connect(self.filter);
                self.audioOut.val = self.filter;
                self.media.loop=doLoop.get();

                patch.loading.finished(loadingId);

                // if(!window.gui)
                // {
                //     self.media.start(0);
                //     playing=true;
                // }
            } );

        };

        request.send();

        self.patch.timer.onPlayPause(seek);
        self.patch.timer.onTimeChange(seek);

    }

};


};

Ops.WebAudio.AudioPlayer.prototype = new CABLES.Op();





// **************************************************************
// 
// Ops.WebAudio.Output
// 
// **************************************************************

Ops.WebAudio.Output = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
op.name='audioOutput';
op.requirements=[CABLES.Requirements.WEBAUDIO];

var audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

// constants
var VOLUME_DEFAULT = 1;
var VOLUME_MIN = 0;
var VOLUME_MAX = 1;

// vars
var gainNode = audioCtx.createGain();
var destinationNode = audioCtx.destination;
gainNode.connect(destinationNode);
var masterVolume = 1;

// inputs
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", gainNode);
var volumePort = op.inValueSlider("Volume", VOLUME_DEFAULT);
var mutePort = op.inValueBool("Mute", false);

// functions
// sets the volume, multiplied by master volume
function setVolume() {
    var volume = volumePort.get() * masterVolume;
    if(volume >= VOLUME_MIN && volume <= VOLUME_MAX) {
        // gainNode.gain.value = volume;
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    } else {
        // gainNode.gain.value = VOLUME_DEFAULT * masterVolume;
        gainNode.gain.setValueAtTime(VOLUME_DEFAULT * masterVolume, audioCtx.currentTime);
    }
}

function mute(b) {
    if(b) {
        // gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    } else {
        setVolume();
    }
}

// change listeners
mutePort.onChange = function() {
    mute(mutePort.get());
};

volumePort.onChange = function() {
    if(mutePort.get()) {
        return;
    }
    setVolume();
};

op.onMasterVolumeChanged = function(v) {
    masterVolume = v;
    setVolume();
};




};

Ops.WebAudio.Output.prototype = new CABLES.Op();
CABLES.OPS["53fdbf4a-bc8d-4c5d-a698-f34fdeb53827"]={f:Ops.WebAudio.Output,objName:"Ops.WebAudio.Output"};




// **************************************************************
// 
// Ops.WebAudio.FFTAreaAverage
// 
// **************************************************************

Ops.WebAudio.FFTAreaAverage = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    fftArr=op.inArray("FFT Array"),
    refresh=op.inTriggerButton("refresh"),
    x=op.inValueSlider("x"),
    y=op.inValueSlider("y"),
    w=op.inValueSlider("width",0.2),
    h=op.inValueSlider("height",0.2),
    texOut=op.outTexture("texture_out"),
    value=op.outValue("value");

const cgl=op.patch.cgl;
var data=[];
var line=0;
var size=128;

const canvas = document.createElement('canvas');
canvas.id = "fft_"+CABLES.uuid();
canvas.width = canvas.height = size;
canvas.style.display = "none";
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);
const ctx = canvas.getContext('2d');

var areaX=0;
var areaY=0;
var areaW=20;
var areaH=20;
var amount=0;

refresh.onTriggered=function()
{
    var arr=fftArr.get();
    if(!arr)return;
    var width=arr.length;

    ctx.beginPath();
    ctx.fillStyle="#000";
    ctx.strokeStyle="#ff0";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#888";
    for(var i=0;i<arr.length;i++)
        ctx.fillRect(i,size-arr[i],1,arr[i]);

    areaX=x.get()*canvas.width;
    areaY=y.get()*canvas.height;

    areaW=w.get()*size/2;
    areaH=h.get()*size/2;

    ctx.rect(areaX,areaY,areaW,areaH);
    ctx.stroke();

    var val=0;
    var count=0;
    for(var xc=areaX;xc<areaX+areaW;xc++)
        for(var yc=areaY;yc<areaY+areaH;yc++)
            if(arr[Math.round(xc)]>size-yc)count++;

    if(amount!=amount)amount=0;
    amount=amount+count/(areaW*areaH);
    amount/=2;
    value.set(amount);

    ctx.fillStyle="#ff0";
    ctx.fillRect(0,0,amount*canvas.width,5);


    if(texOut.get()) texOut.get().initTexture(canvas,CGL.Texture.FILTER_NEAREST);
        else texOut.set(new CGL.Texture.createFromImage( cgl, canvas, { "filter":CGL.Texture.FILTER_NEAREST } ));

};


};

Ops.WebAudio.FFTAreaAverage.prototype = new CABLES.Op();
CABLES.OPS["ed633fe4-3200-4890-8d9e-ccd1ea478c74"]={f:Ops.WebAudio.FFTAreaAverage,objName:"Ops.WebAudio.FFTAreaAverage"};




// **************************************************************
// 
// Ops.WebAudio.AudioAnalyzer
// 
// **************************************************************

Ops.WebAudio.AudioAnalyzer = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
CABLES.WEBAUDIO.createAudioContext(op);

const analyser = audioContext.createAnalyser();
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 256;

const refresh=op.addInPort(new CABLES.Port(op,"refresh",CABLES.OP_PORT_TYPE_FUNCTION));
const audioIn = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", analyser);
const anData=op.inValueSelect("Data",["Frequency","Time Domain"],"Frequency");

const next=op.outTrigger("Next");
const audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", analyser);
const avgVolume=op.addOutPort(new CABLES.Port(op, "average volume",CABLES.OP_PORT_TYPE_VALUE));
const fftOut=op.addOutPort(new CABLES.Port(op, "fft",CABLES.OP_PORT_TYPE_ARRAY));

var fftBufferLength = analyser.frequencyBinCount;
var fftDataArray = new Uint8Array(fftBufferLength);
var getFreq=true;
var array=null;

anData.onChange=function() {
    if(anData.get()=="Frequency")getFreq=true;
    if(anData.get()=="Time Domain")getFreq=false;
};

refresh.onTriggered = function()
{
    analyser.minDecibels = -90;
    analyser.maxDecibels = 0;

    if(!fftDataArray)
    {
        op.log("fftDataArray is null, returning.");
        return;
    }
    var values = 0;

    for (var i = 0; i < fftDataArray.length; i++) values += fftDataArray[i];

    var average = values / fftDataArray.length;

    avgVolume.set(average/128);
    try
    {
        if(getFreq) analyser.getByteFrequencyData(fftDataArray);
            else analyser.getByteTimeDomainData(fftDataArray);    
    }
    catch(e) { op.log(e); }

    fftOut.set(null);
    fftOut.set(fftDataArray);

    next.trigger();
};



};

Ops.WebAudio.AudioAnalyzer.prototype = new CABLES.Op();
CABLES.OPS["22523fae-a623-401d-b952-a57c26de4b4e"]={f:Ops.WebAudio.AudioAnalyzer,objName:"Ops.WebAudio.AudioAnalyzer"};




// **************************************************************
// 
// Ops.Gl.MainLoop
// 
// **************************************************************

Ops.Gl.MainLoop = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const fpsLimit=op.inValue("FPS Limit",0);
const trigger=op.outTrigger("trigger");
const width=op.outValue("width");
const height=op.outValue("height");
const reduceLoadingFPS=op.inValueBool("Reduce FPS loading");
const clear=op.inValueBool("Clear",true);
const fullscreen=op.inValueBool("Fullscreen Button",false);
const active=op.inValueBool("Active",true);
const hdpi=op.inValueBool("Hires Displays",false);

hdpi.onChange=function()
{
    if(hdpi.get()) op.patch.cgl.pixelDensity=window.devicePixelRatio;
        else op.patch.cgl.pixelDensity=1;
        
    op.patch.cgl.updateSize();
    if(CABLES.UI) gui.setLayout();
};


var cgl=op.patch.cgl;
var rframes=0;
var rframeStart=0;

if(!op.patch.cgl) op.uiAttr( { 'error': 'No webgl cgl context' } );

var identTranslate=vec3.create();
vec3.set(identTranslate, 0,0,0);
var identTranslateView=vec3.create();
vec3.set(identTranslateView, 0,0,-2);

fullscreen.onChange=updateFullscreenButton;
setTimeout(updateFullscreenButton,100);
var fsElement=null;

function updateFullscreenButton()
{
    function onMouseEnter()
    {
        if(fsElement)fsElement.style.display="block";
    }

    function onMouseLeave()
    {
        if(fsElement)fsElement.style.display="none";
    }
    
    op.patch.cgl.canvas.addEventListener('mouseleave', onMouseLeave);
    op.patch.cgl.canvas.addEventListener('mouseenter', onMouseEnter);

    if(fullscreen.get())
    {
        if(!fsElement) 
        {
            fsElement = document.createElement('div');

            var container = op.patch.cgl.canvas.parentElement;
            if(container)container.appendChild(fsElement);
    
            fsElement.addEventListener('mouseenter', onMouseEnter);
            fsElement.addEventListener('click', function(e)
            {
                if(CABLES.UI && !e.shiftKey) gui.cycleRendererSize();
                    else
                    {
                        cgl.fullScreen();
                    }
            });
        }

        fsElement.style.padding="10px";
        fsElement.style.position="absolute";
        fsElement.style.right="5px";
        fsElement.style.top="5px";
        fsElement.style.width="20px";
        fsElement.style.height="20px";
        // fsElement.style.opacity="1.0";
        fsElement.style.cursor="pointer";
        fsElement.style['border-radius']="40px";
        fsElement.style.background="#444";
        fsElement.style["z-index"]="9999";
        fsElement.style.display="none";
        fsElement.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 490 490" style="width:20px;height:20px;" xml:space="preserve" width="512px" height="512px"><g><path d="M173.792,301.792L21.333,454.251v-80.917c0-5.891-4.776-10.667-10.667-10.667C4.776,362.667,0,367.442,0,373.333V480     c0,5.891,4.776,10.667,10.667,10.667h106.667c5.891,0,10.667-4.776,10.667-10.667s-4.776-10.667-10.667-10.667H36.416     l152.459-152.459c4.093-4.237,3.975-10.99-0.262-15.083C184.479,297.799,177.926,297.799,173.792,301.792z" fill="#FFFFFF"/><path d="M480,0H373.333c-5.891,0-10.667,4.776-10.667,10.667c0,5.891,4.776,10.667,10.667,10.667h80.917L301.792,173.792     c-4.237,4.093-4.354,10.845-0.262,15.083c4.093,4.237,10.845,4.354,15.083,0.262c0.089-0.086,0.176-0.173,0.262-0.262     L469.333,36.416v80.917c0,5.891,4.776,10.667,10.667,10.667s10.667-4.776,10.667-10.667V10.667C490.667,4.776,485.891,0,480,0z" fill="#FFFFFF"/><path d="M36.416,21.333h80.917c5.891,0,10.667-4.776,10.667-10.667C128,4.776,123.224,0,117.333,0H10.667     C4.776,0,0,4.776,0,10.667v106.667C0,123.224,4.776,128,10.667,128c5.891,0,10.667-4.776,10.667-10.667V36.416l152.459,152.459     c4.237,4.093,10.99,3.975,15.083-0.262c3.992-4.134,3.992-10.687,0-14.82L36.416,21.333z" fill="#FFFFFF"/><path d="M480,362.667c-5.891,0-10.667,4.776-10.667,10.667v80.917L316.875,301.792c-4.237-4.093-10.99-3.976-15.083,0.261     c-3.993,4.134-3.993,10.688,0,14.821l152.459,152.459h-80.917c-5.891,0-10.667,4.776-10.667,10.667s4.776,10.667,10.667,10.667     H480c5.891,0,10.667-4.776,10.667-10.667V373.333C490.667,367.442,485.891,362.667,480,362.667z" fill="#FFFFFF"/></g></svg>';
    }
    else
    {
        if(fsElement)
        {
            fsElement.style.display="none";
            fsElement.remove();
            fsElement=null;
        }
    }
}


fpsLimit.onChange=function()
{
    op.patch.config.fpsLimit=fpsLimit.get()||0;
};

op.onDelete=function()
{
    cgl.gl.clearColor(0,0,0,0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    op.patch.removeOnAnimFrame(op);
};


op.patch.loading.setOnFinishedLoading(function(cb)
{
    op.patch.config.fpsLimit=fpsLimit.get();
});



op.onAnimFrame=function(time)
{
    if(!active.get())return;
    if(cgl.aborted || cgl.canvas.clientWidth===0 || cgl.canvas.clientHeight===0)return;

    if(op.patch.loading.getProgress()<1.0 && reduceLoadingFPS.get())
    {
        op.patch.config.fpsLimit=5;
    }

    if(cgl.canvasWidth==-1)
    {
        cgl.setCanvas(op.patch.config.glCanvasId);
        return;
    }

    if(cgl.canvasWidth!=width.get() || cgl.canvasHeight!=height.get())
    {
        // cgl.canvasWidth=cgl.canvas.clientWidth;
        width.set(cgl.canvasWidth);
        // cgl.canvasHeight=cgl.canvas.clientHeight;
        height.set(cgl.canvasHeight);
    }

    if(CABLES.now()-rframeStart>1000)
    {
        CGL.fpsReport=CGL.fpsReport||[];
        if(op.patch.loading.getProgress()>=1.0 && rframeStart!==0)CGL.fpsReport.push(rframes);
        rframes=0;
        rframeStart=CABLES.now();
    }
    CGL.MESH.lastShader=null;
    CGL.MESH.lastMesh=null;

    cgl.renderStart(cgl,identTranslate,identTranslateView);

    if(clear.get())
    {
        cgl.gl.clearColor(0,0,0,1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    }

    trigger.trigger();


    if(CGL.MESH.lastMesh)CGL.MESH.lastMesh.unBind();


    if(CGL.Texture.previewTexture)
    {
        if(!CGL.Texture.texturePreviewer) CGL.Texture.texturePreviewer=new CGL.Texture.texturePreview(cgl);
        CGL.Texture.texturePreviewer.render(CGL.Texture.previewTexture);
    }
    cgl.renderEnd(cgl);
    
    
    // cgl.printError('mainloop end');
    
    

    if(!cgl.frameStore.phong)cgl.frameStore.phong={};
    rframes++;
};


};

Ops.Gl.MainLoop.prototype = new CABLES.Op();
CABLES.OPS["b0472a1d-db16-4ba6-8787-f300fbdc77bb"]={f:Ops.Gl.MainLoop,objName:"Ops.Gl.MainLoop"};




// **************************************************************
// 
// Ops.Gl.Phong.PointLight
// 
// **************************************************************

Ops.Gl.Phong.PointLight = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};


var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.outTrigger('trigger');

var attachment=op.addOutPort(new CABLES.Port(op,"attachment",CABLES.OP_PORT_TYPE_FUNCTION));


var radius=op.inValue("Radius",100);
var fallOff=op.inValueSlider("Fall Off",0.1);
var intensity=op.inValue("Intensity",1);

var x=op.addInPort(new CABLES.Port(op,"x",CABLES.OP_PORT_TYPE_VALUE));
var y=op.addInPort(new CABLES.Port(op,"y",CABLES.OP_PORT_TYPE_VALUE));
var z=op.addInPort(new CABLES.Port(op,"z",CABLES.OP_PORT_TYPE_VALUE));

var r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

var ambientR=op.inValue("Ambient R",0.1);
var ambientG=op.inValue("Ambient G",0.1);
var ambientB=op.inValue("Ambient B",0.1);

var specularR=op.addInPort(new CABLES.Port(op,"Specular R",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var specularG=op.addInPort(new CABLES.Port(op,"Specular G",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var specularB=op.addInPort(new CABLES.Port(op,"Specular B",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));


ambientR.set(0);
ambientG.set(0);
ambientB.set(0);

specularR.set(1);
specularG.set(1);
specularB.set(1);

r.set(1);
g.set(1);
b.set(1);


var cgl=op.patch.cgl;


radius.onChange=updateAll;
fallOff.onChange=updateAll;
intensity.onChange=updateAll;
r.onChange=updateAll;
g.onChange=updateAll;
b.onChange=updateAll;
x.onChange=updateAll;
y.onChange=updateAll;
z.onChange=updateAll;

ambientR.onChange=updateAll;
ambientG.onChange=updateAll;
ambientB.onChange=updateAll;
specularR.onChange=updateAll;
specularG.onChange=updateAll;
specularB.onChange=updateAll;




var id=CABLES.generateUUID();
var light={};

var posVec=vec3.create();
var mpos=vec3.create();
var needsUpdate=true;

updateAll();


function updateColor()
{
    light.color=light.color||[];
    light.color[0]=r.get();
    light.color[1]=g.get();
    light.color[2]=b.get();

    light.ambient=light.ambient||[];
    light.ambient[0]=ambientR.get();
    light.ambient[1]=ambientG.get();
    light.ambient[2]=ambientB.get();
    
    light.specular=light.specular||[];
    light.specular[0]=specularR.get();
    light.specular[1]=specularG.get();
    light.specular[2]=specularB.get();
    
    light.changed=true;
}


function updatePos()
{
}

function updateAll()
{
    needsUpdate=true;
}

var transVec=vec3.create();

exe.onTriggered=function()
{
    if(needsUpdate)
    {
        if(!cgl.frameStore.phong)cgl.frameStore.phong={};
        if(!cgl.frameStore.phong.lights)cgl.frameStore.phong.lights=[];
        light=light||{};
        light.id=id;
        light.type=0;
        light.changed=true;
        light.radius=radius.get();
        light.fallOff=fallOff.get();
        light.mul=intensity.get();
    
        updatePos();
        updateColor();
        needsUpdate=false;
    }
    
    
    
    cgl.frameStore.phong.lights=cgl.frameStore.phong.lights||[];

    vec3.set(transVec,x.get(),y.get(),z.get());
    vec3.transformMat4(mpos, transVec, cgl.mvMatrix);
    light=light||{};
    
    light.pos=mpos;
    light.type=0;


    if(CABLES.UI && CABLES.UI.renderHelper)
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,transVec);
        CABLES.GL_MARKER.drawSphere(op,radius.get()*2);
        cgl.popModelMatrix();
    }

    if(attachment.isLinked())
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,transVec);
        attachment.trigger();
        cgl.popModelMatrix();
    }

    cgl.frameStore.phong.lights.push(light);
    trigger.trigger();
    cgl.frameStore.phong.lights.pop();
    
    if(CABLES.UI && gui.patch().isCurrentOp(op)) 
        gui.setTransformGizmo(
            {
                posX:x,
                posY:y,
                posZ:z
            });
};



};

Ops.Gl.Phong.PointLight.prototype = new CABLES.Op();
CABLES.OPS["1d2cf105-f66d-4a31-949e-b1887d582080"]={f:Ops.Gl.Phong.PointLight,objName:"Ops.Gl.Phong.PointLight"};




// **************************************************************
// 
// Ops.Gl.Phong.PhongMaterial
// 
// **************************************************************

Ops.Gl.Phong.PhongMaterial = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={phong_frag:"// #extension GL_OES_standard_derivatives : enable\n\n{{MODULES_HEAD}}\n\n\n//some settings for the look and feel of the material\nconst float specularScale = 0.65;\nconst float roughness = 1110.0;\nconst float albedo = 0.9;\n\nUNI float shininess;\nUNI float specularStrength;\nUNI float fresnel;\n\n#ifdef HAS_TEXTURE_DIFFUSE\n    UNI sampler2D texDiffuse;\n#endif\n#ifdef HAS_TEXTURE_SPECULAR\n    UNI sampler2D texSpecular;\n#endif\n\n#ifdef HAS_TEXTURE_NORMAL\n    UNI sampler2D texNormal;\n#endif\n\nUNI float r,g,b,a;\n\nUNI float diffuseRepeatX;\nUNI float diffuseRepeatY;\n\nUNI int flatShading;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\nIN  vec2 texCoord;\n\nstruct Light {\n  vec3 pos;\n  vec3 color;\n  vec3 ambient;\n  vec3 specular;\n  float falloff;\n  float radius;\n  float mul;\n};\n\nIN mat3 normalMatrix;\n\n\nUNI Light lights[4];\n\nIN vec3 vViewPosition;\nIN vec3 vNormal;\n\n//import some common functions\n// vec3 normals_4_0(vec3 pos) {\n//   vec3 fdx = dFdx(pos);\n//   vec3 fdy = dFdy(pos);\n//   return normalize(cross(fdx, fdy));\n// }\n\n\n// http://www.thetenthplanet.de/archives/1180\n// mat3 cotangentFrame_8_1(vec3 N, vec3 p, vec2 uv) {\n//   // get edge vectors of the pixel triangle\n//   vec3 dp1 = dFdx(p);\n//   vec3 dp2 = dFdy(p);\n//   vec2 duv1 = dFdx(uv);\n//   vec2 duv2 = dFdy(uv);\n\n//   // solve the linear system\n//   vec3 dp2perp = cross(dp2, N);\n//   vec3 dp1perp = cross(N, dp1);\n//   vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;\n//   vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;\n\n//   // construct a scale-invariant frame\n//   float invmax = 1.0 / sqrt(max(dot(T,T), dot(B,B)));\n//   return mat3(T * invmax, B * invmax, N);\n// }\n\n\n\n// vec3 perturb_6_2(vec3 map, vec3 N, vec3 V, vec2 texcoord) {\n//   mat3 TBN = cotangentFrame_8_1(N, -V, texcoord);\n//   return normalize(TBN * map);\n// }\n\n\nfloat orenNayarDiffuse_5_3(\n  vec3 lightDirection,\n  vec3 viewDirection,\n  vec3 surfaceNormal,\n  float roughness,\n  float albedo) {\n\n  float LdotV = dot(lightDirection, viewDirection);\n  float NdotL = dot(lightDirection, surfaceNormal);\n  float NdotV = dot(surfaceNormal, viewDirection);\n\n  float s = LdotV - NdotL * NdotV;\n  float t = mix(1.0, max(NdotL, NdotV), step(0.0, s));\n\n  float sigma2 = roughness * roughness;\n  float A = 1.0 + sigma2 * (albedo / (sigma2 + 0.13) + 0.5 / (sigma2 + 0.33));\n  float B = 0.45 * sigma2 / (sigma2 + 0.09);\n\n  return albedo * max(0.0, NdotL) * (A + B * s / t) / 3.14159265;\n}\n\n\nfloat phongSpecular_7_4(\n  vec3 lightDirection,\n  vec3 viewDirection,\n  vec3 surfaceNormal,\n  float shininess) {\n\n  //Calculate Phong power\n  vec3 R = -reflect(lightDirection, surfaceNormal);\n  return pow(max(0.0, dot(viewDirection, R)), shininess);\n}\n\n\n// by Tom Madams\n// Simple:\n// https://imdoingitwrong.wordpress.com/2011/01/31/light-attenuation/\n//\n// Improved\n// https://imdoingitwrong.wordpress.com/2011/02/10/improved-light-attenuation/\nfloat attenuation_1_5(float r, float f, float d) {\n  float denom = d / r + 1.0;\n  float attenuation = 1.0 / (denom*denom);\n  float t = (attenuation - f) / (1.0 - f);\n  return max(t, 0.0);\n}\n\n\nconst float gamma_2_6 = 2.2;\n\nfloat toLinear_2_7(float v) {\n  return pow(v, gamma_2_6);\n}\n\nvec2 toLinear_2_7(vec2 v) {\n  return pow(v, vec2(gamma_2_6));\n}\n\nvec3 toLinear_2_7(vec3 v) {\n  return pow(v, vec3(gamma_2_6));\n}\n\nvec4 toLinear_2_7(vec4 v) {\n  return vec4(toLinear_2_7(v.rgb), v.a);\n}\n\n\n\nconst float gamma_3_8 = 2.2;\n\nfloat toGamma_3_9(float v) {\n  return pow(v, 1.0 / gamma_3_8);\n}\n\nvec2 toGamma_3_9(vec2 v) {\n  return pow(v, vec2(1.0 / gamma_3_8));\n}\n\nvec3 toGamma_3_9(vec3 v) {\n  return pow(v, vec3(1.0 / gamma_3_8));\n}\n\nvec4 toGamma_3_9(vec4 v) {\n  return vec4(toGamma_3_9(v.rgb), v.a);\n}\n\n//account for gamma-corrected images\nvec4 textureLinear(sampler2D uTex, vec2 uv) {\n  return toLinear_2_7(texture2D(uTex, uv));\n}\n\n\nfloat calcFresnel(vec3 direction, vec3 normal)\n{\n    vec3 nDirection = normalize( direction );\n    vec3 nNormal = normalize( normal );\n    vec3 halfDirection = normalize( nNormal + nDirection );\n\n    float cosine = dot( halfDirection, nDirection );\n    float product = max( cosine, 0.0 );\n    float factor = pow( product, 5.0 );\n\n    return factor;\n}\n\nvoid main()\n{\n    vec2 UV_SCALE = vec2(diffuseRepeatX,diffuseRepeatY);\n\n    vec3 color = vec3(0.0);\n    vec2 uv = texCoord * UV_SCALE;\n\n    #ifdef HAS_TEXTURE_DIFFUSE\n        vec3 diffuseColor = texture2D(texDiffuse, uv).rgb;\n    #endif\n    #ifndef HAS_TEXTURE_DIFFUSE\n        vec3 diffuseColor = vec3(r,g,b);\n    #endif\n\n    #ifdef HAS_TEXTURE_NORMAL\n        vec3 normalMap = texture2D(texNormal, uv).rgb * 2.0 - 1.0;\n        normalMap=normalize(normalMatrix * normalMap);\n    #endif\n\n    float specStrength = specularStrength;\n    #ifdef HAS_TEXTURE_SPECULAR\n        specStrength = specularStrength*texture2D(texSpecular, uv).r;\n    #endif\n\n    vec3 specular=vec3(0.0);\n\n    for(int l=0;l<NUM_LIGHTS;l++)\n    {\n        Light light=lights[l];\n\n        //determine the type of normals for lighting\n        vec3 normal = vec3(0.0);\n        //   if (flatShading == 1) {\n        //     normal = normals_4_0(vViewPosition);\n        //   } else {\n        normal = vNormal;\n        //   }\n\n        // if(!gl_FrontFacing) normal*=vec3(-1);\n\n        //determine surface to light direction\n        vec4 lightPosition = viewMatrix * vec4(light.pos, 1.0);\n        vec3 lightVector = lightPosition.xyz - vViewPosition;\n\n        //calculate attenuation\n        float lightDistance = length(lightVector);\n        float falloff = attenuation_1_5(light.radius, light.falloff, lightDistance);\n\n        //now sample from our repeating brick texture\n        //assume its in sRGB, so we need to correct for gamma\n        //our normal map has an inverted green channel\n\n        vec3 L = normalize(lightVector);              //light direction\n        vec3 V = normalize(vViewPosition);            //eye direction\n\n        vec3 N = normal;//perturb_6_2(normalMap, normal, -V, vUv); //surface normal\n\n        #ifdef HAS_TEXTURE_NORMAL\n            N = normalize( (normalMap+normal) );\n        #endif\n\n        //compute our diffuse & specular terms\n        specular += specStrength * phongSpecular_7_4(L, -V, N, shininess) * specularScale * falloff * light.specular;\n        vec3 diffuse = light.color * orenNayarDiffuse_5_3(L, V, N, roughness, albedo) * falloff * light.mul;\n        vec3 ambient = light.ambient;\n\n        //add the lighting\n        color += (diffuse + ambient);\n\n        if(fresnel!=0.0) color+=calcFresnel(V,normal)*fresnel*5.0;\n    }\n\n    color*=diffuseColor;\n    color+=specular;\n    // color=toGamma_3_9(color);\n    vec4 col=vec4(color,a);\n    {{MODULE_COLOR}}\n\n\n    outColor= col;\n    // gl_FragColor.a =a;\n}\n\n",phong_vert:"\n{{MODULES_HEAD}}\n\nIN vec3 vPosition;\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\nIN vec3 attrVertNormal;\nIN vec2 attrTexCoord;\n\n// IN vec3 attrTangent;\n// IN vec3 attrBiTangent;\nOUT vec3 vTangent;\nOUT vec3 vBiTangent;\n\n\nOUT mediump vec3 norm;\nOUT mediump vec3 vert;\nOUT mat4 mvMatrix;\n// UNI mat4 normalMatrix;\n\nOUT vec3 vViewPosition;\nOUT vec3 vNormal;\n\n\n#ifdef HAS_TEXTURES\n    OUT  vec2 texCoord;\n#endif\n\nOUT mat3 normalMatrix;\nOUT vec4 modelPos;\n\n\n// import some common functions not supported by GLSL ES\nfloat transpose_1_0(float m) {\n  return m;\n}\n\nmat2 transpose_1_0(mat2 m) {\n  return mat2(m[0][0], m[1][0],\n              m[0][1], m[1][1]);\n}\n\nmat3 transpose_1_0(mat3 m) {\n  return mat3(m[0][0], m[1][0], m[2][0],\n              m[0][1], m[1][1], m[2][1],\n              m[0][2], m[1][2], m[2][2]);\n}\n\nmat4 transpose_1_0(mat4 m) {\n  return mat4(m[0][0], m[1][0], m[2][0], m[3][0],\n              m[0][1], m[1][1], m[2][1], m[3][1],\n              m[0][2], m[1][2], m[2][2], m[3][2],\n              m[0][3], m[1][3], m[2][3], m[3][3]);\n}\n\n\nmat3 inverse_2_1(mat3 m) {\n  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n  float b01 = a22 * a11 - a12 * a21;\n  float b11 = -a22 * a10 + a12 * a20;\n  float b21 = a21 * a10 - a11 * a20;\n\n  float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nvoid main()\n{\n    norm=attrVertNormal;\n    vert=vPosition;\n\n    // vTangent=attrTangent;\n    // vBiTangent=attrBiTangent;\n\n    #ifdef HAS_TEXTURES\n        texCoord=attrTexCoord;\n    #endif\n\n    mat4 mMatrix=modelMatrix;\n    vec4 pos = vec4( vPosition, 1. );\n    modelPos=modelMatrix*pos;\n\n\n\n    {{MODULE_VERTEX_POSITION}}\n    \n    mvMatrix=viewMatrix * mMatrix;\n\n\n    vec4 viewModelPosition = mvMatrix * pos;\n    vViewPosition = viewModelPosition.xyz;\n\n    // Rotate the object normals by a 3x3 normal matrix.\n    // We could also do this CPU-side to avoid doing it per-vertex\n    normalMatrix = transpose_1_0(inverse_2_1(mat3(mvMatrix)));\n    vNormal = normalize(normalMatrix * norm);\n\n    gl_Position = projMatrix * mvMatrix * pos;\n}\n\n\n\n\n// float inverse_2_1(float m) {\n//   return 1.0 / m;\n// }\n\n// mat2 inverse_2_1(mat2 m) {\n//   return mat2(m[1][1],-m[0][1],\n//              -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);\n// }\n\n\n// mat4 inverse_2_1(mat4 m) {\n//   float\n//       a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n//       a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n//       a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n//       a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n\n//       b00 = a00 * a11 - a01 * a10,\n//       b01 = a00 * a12 - a02 * a10,\n//       b02 = a00 * a13 - a03 * a10,\n//       b03 = a01 * a12 - a02 * a11,\n//       b04 = a01 * a13 - a03 * a11,\n//       b05 = a02 * a13 - a03 * a12,\n//       b06 = a20 * a31 - a21 * a30,\n//       b07 = a20 * a32 - a22 * a30,\n//       b08 = a20 * a33 - a23 * a30,\n//       b09 = a21 * a32 - a22 * a31,\n//       b10 = a21 * a33 - a23 * a31,\n//       b11 = a22 * a33 - a23 * a32,\n\n//       det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n//   return mat4(\n//       a11 * b11 - a12 * b10 + a13 * b09,\n//       a02 * b10 - a01 * b11 - a03 * b09,\n//       a31 * b05 - a32 * b04 + a33 * b03,\n//       a22 * b04 - a21 * b05 - a23 * b03,\n//       a12 * b08 - a10 * b11 - a13 * b07,\n//       a00 * b11 - a02 * b08 + a03 * b07,\n//       a32 * b02 - a30 * b05 - a33 * b01,\n//       a20 * b05 - a22 * b02 + a23 * b01,\n//       a10 * b10 - a11 * b08 + a13 * b06,\n//       a01 * b08 - a00 * b10 - a03 * b06,\n//       a30 * b04 - a31 * b02 + a33 * b00,\n//       a21 * b02 - a20 * b04 - a23 * b00,\n//       a11 * b07 - a10 * b09 - a12 * b06,\n//       a00 * b09 - a01 * b07 + a02 * b06,\n//       a31 * b01 - a30 * b03 - a32 * b00,\n//       a20 * b03 - a21 * b01 + a22 * b00) / det;\n// }\n",};
var cgl=this.patch.cgl;

// adapted from:
// http://www.tomdalling.com/blog/modern-opengl/07-more-lighting-ambient-specular-attenuation-gamma/

var render=this.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION) );

var trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var shaderOut=this.addOutPort(new CABLES.Port(this,"shader",CABLES.OP_PORT_TYPE_OBJECT));

var specularStrength=op.inValue("Specular Strength",1);
var shininess=op.inValue("Shininess",20);
var fresnel=op.inValueSlider("Fresnel",0);




shaderOut.ignoreValueSerialize=true;
var MAX_LIGHTS=16;




var shader=new CGL.Shader(cgl,'PhongMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_NORMAL','MODULE_BEGIN_FRAG']);

shader.setSource(attachments.phong_vert,attachments.phong_frag);
shaderOut.set(shader);

var uniSpecStrngth=new CGL.Uniform(shader,'f','specularStrength',specularStrength);
var uniShininess=new CGL.Uniform(shader,'f','shininess',shininess);
var uniFresnel=new CGL.Uniform(shader,'f','fresnel',fresnel);



var lights=[];

var depthTex=new CGL.Uniform(shader,'t','depthTex',5);

var uniShadowPass=new CGL.Uniform(shader,'f','shadowPass',0);

for(var i=0;i<MAX_LIGHTS;i++)
{
    var count=i;
    lights[count]={};
    lights[count].pos=new CGL.Uniform(shader,'3f','lights['+count+'].pos',[0,11,0]);
    lights[count].target=new CGL.Uniform(shader,'3f','lights['+count+'].target',[0,0,0]);
    lights[count].color=new CGL.Uniform(shader,'3f','lights['+count+'].color',[1,1,1]);
    lights[count].attenuation=new CGL.Uniform(shader,'f','lights['+count+'].attenuation',0.1);
    lights[count].type=new CGL.Uniform(shader,'f','lights['+count+'].type',0);
    lights[count].cone=new CGL.Uniform(shader,'f','lights['+count+'].cone',0.8);
    lights[count].mul=new CGL.Uniform(shader,'f','lights['+count+'].mul',1);
    
    lights[count].ambient=new CGL.Uniform(shader,'3f','lights['+count+'].ambient',1);
    lights[count].specular=new CGL.Uniform(shader,'3f','lights['+count+'].specular',1);
    
    lights[count].fallOff=new CGL.Uniform(shader,'f','lights['+count+'].falloff',0);
    lights[count].radius=new CGL.Uniform(shader,'f','lights['+count+'].radius',10);
    
//   vec3 pos;
//   vec3 color;
//   vec3 ambient;
//   float falloff;
//   float radius;

    // lights[count].depthMVP=new CGL.Uniform(shader,'m4','lights['+count+'].depthMVP',mat4.create());
}

var normIntensity=op.inValue("Normal Texture Intensity",1);
var uniNormIntensity=new CGL.Uniform(shader,'f','normalTexIntensity',normIntensity);




{
    // diffuse color

    var r=this.addInPort(new CABLES.Port(this,"diffuse r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    r.onChange=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
        else r.uniform.setValue(r.get());
    };

    var g=this.addInPort(new CABLES.Port(this,"diffuse g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    g.onChange=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
        else g.uniform.setValue(g.get());
    };

    var b=this.addInPort(new CABLES.Port(this,"diffuse b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.onChange=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
        else b.uniform.setValue(b.get());
    };

    var a=this.addInPort(new CABLES.Port(this,"diffuse a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    a.onChange=function()
    {
        if(!a.uniform) a.uniform=new CGL.Uniform(shader,'f','a',a.get());
        else a.uniform.setValue(a.get());
    };

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
    a.set(1.0);
}



{
    var colorizeTex=this.addInPort(new CABLES.Port(this,"colorize texture",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
    colorizeTex.onChange=function()
    {
        if(colorizeTex.get()) shader.define('COLORIZE_TEXTURE');
            else shader.removeDefine('COLORIZE_TEXTURE');
    };
}

{
    // diffuse texture

    var diffuseTexture=this.addInPort(new CABLES.Port(this,"texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
    var diffuseTextureUniform=null;
    shader.bindTextures=bindTextures;

    diffuseTexture.onChange=function()
    {
        if(diffuseTexture.get())
        {
            if(diffuseTextureUniform!==null)return;
            shader.removeUniform('texDiffuse');
            shader.define('HAS_TEXTURE_DIFFUSE');
            diffuseTextureUniform=new CGL.Uniform(shader,'t','texDiffuse',0);
        }
        else
        {
            shader.removeUniform('texDiffuse');
            shader.removeDefine('HAS_TEXTURE_DIFFUSE');
            diffuseTextureUniform=null;
        }
    };

    var aoTexture=this.addInPort(new CABLES.Port(this,"AO Texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
    var aoTextureUniform=null;
    aoTexture.ignoreValueSerialize=true;
    shader.bindTextures=bindTextures;

    aoTexture.onChange=function()
    {
        if(aoTexture.get())
        {
            if(aoTextureUniform!==null)return;
            shader.removeUniform('texAo');
            shader.define('HAS_TEXTURE_AO');
            aoTextureUniform=new CGL.Uniform(shader,'t','texAo',1);
        }
        else
        {
            shader.removeUniform('texAo');
            shader.removeDefine('HAS_TEXTURE_AO');
            aoTextureUniform=null;
        }
    };


    var specTexture=this.addInPort(new CABLES.Port(this,"Specular Texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
    var specTextureUniform=null;

    specTexture.onChange=function()
    {
        if(specTexture.get())
        {
            if(specTextureUniform!==null)return;
            shader.removeUniform('texSpecular');
            shader.define('HAS_TEXTURE_SPECULAR');
            specTextureUniform=new CGL.Uniform(shader,'t','texSpecular',2);
        }
        else
        {
            shader.removeUniform('texSpecular');
            shader.removeDefine('HAS_TEXTURE_SPECULAR');
            specTextureUniform=null;
        }
    };


    var normalTexture=this.addInPort(new CABLES.Port(this,"Normal Texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
    var normalTextureUniform=null;

    normalTexture.onChange=function()
    {
        if(normalTexture.get())
        {
            if(normalTextureUniform!==null)return;
            shader.removeUniform('texNormal');
            shader.define('HAS_TEXTURE_NORMAL');
            normalTextureUniform=new CGL.Uniform(shader,'t','texNormal',3);
        }
        else
        {
            shader.removeUniform('texNormal');
            shader.removeDefine('HAS_TEXTURE_NORMAL');
            normalTextureUniform=null;
        }
    };



    var diffuseRepeatX=this.addInPort(new CABLES.Port(this,"diffuseRepeatX",CABLES.OP_PORT_TYPE_VALUE));
    var diffuseRepeatY=this.addInPort(new CABLES.Port(this,"diffuseRepeatY",CABLES.OP_PORT_TYPE_VALUE));
    diffuseRepeatX.set(1);
    diffuseRepeatY.set(1);

    diffuseRepeatX.onChange=function()
    {
        diffuseRepeatXUniform.setValue(diffuseRepeatX.get());
    };

    diffuseRepeatY.onChange=function()
    {
        diffuseRepeatYUniform.setValue(diffuseRepeatY.get());
    };

    var diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',diffuseRepeatX.get());
    var diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',diffuseRepeatY.get());
}



{
    //lights
    var numLights=-1;

    var updateLights=function()
    {
        var count=0;
        var i=0;
        var num=0;
        if(!cgl.frameStore.phong || !cgl.frameStore.phong.lights)
        {
            num=0;
        }
        else
        {
            for(i in cgl.frameStore.phong.lights)
            {
                num++;
            }
        }
        if(num!=numLights)
        {
            numLights=num;
            shader.define('NUM_LIGHTS',''+Math.max(numLights,1));
        }

        if(!cgl.frameStore.phong || !cgl.frameStore.phong.lights)
        {
            // numLights=1;
            // lights[0].pos.setValue([1,2,0]);
            // lights[0].target.setValue([0,0,0]);
            // lights[0].color.setValue([1,1,1]);
            // lights[0].attenuation.setValue(0);
            // lights[0].type.setValue(0);
            // lights[0].cone.setValue(0.8);
        }
        else
        {
            count=0;
            if(shader)
                for(i in cgl.frameStore.phong.lights)
                {
                    lights[count].pos.setValue(cgl.frameStore.phong.lights[i].pos);
                    // if(cgl.frameStore.phong.lights[i].changed)
                    {
                        cgl.frameStore.phong.lights[i].changed=false;
                        if(cgl.frameStore.phong.lights[i].target) lights[count].target.setValue(cgl.frameStore.phong.lights[i].target);

                        lights[count].fallOff.setValue(cgl.frameStore.phong.lights[i].fallOff);
                        lights[count].radius.setValue(cgl.frameStore.phong.lights[i].radius);

                        lights[count].color.setValue(cgl.frameStore.phong.lights[i].color);
                        lights[count].ambient.setValue(cgl.frameStore.phong.lights[i].ambient);
                        lights[count].specular.setValue(cgl.frameStore.phong.lights[i].specular);
                        lights[count].attenuation.setValue(cgl.frameStore.phong.lights[i].attenuation);
                        lights[count].type.setValue(cgl.frameStore.phong.lights[i].type);
                        if(cgl.frameStore.phong.lights[i].cone) lights[count].cone.setValue(cgl.frameStore.phong.lights[i].cone);
                        // if(cgl.frameStore.phong.lights[i].depthMVP) lights[count].depthMVP.setValue(cgl.frameStore.phong.lights[i].depthMVP);
                        if(cgl.frameStore.phong.lights[i].depthTex) lights[count].texDepthTex=cgl.frameStore.phong.lights[i].depthTex;

                        lights[count].mul.setValue(cgl.frameStore.phong.lights[i].mul||1);
                    }

                    count++;
                }
        }
    }

}

var bindTextures=function()
{
    if(diffuseTexture.get())
    {
        cgl.setTexture(0,diffuseTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, diffuseTexture.get().tex);
    }

    if(aoTexture.get())
    {
        cgl.setTexture(1,aoTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, aoTexture.get().tex);
    }

    if(specTexture.get())
    {
        cgl.setTexture(2, specTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, specTexture.get().tex);
    }

    if(normalTexture.get())
    {
        cgl.setTexture(3, normalTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, normalTexture.get().tex);
    }

    uniShadowPass.setValue(0);
    if(cgl.frameStore.phong && cgl.frameStore.phong.lights)
        for(i in cgl.frameStore.phong.lights)
        {
            if(cgl.frameStore.phong.lights[i].shadowPass==1.0)uniShadowPass.setValue(1);
        }
}

var doRender=function()
{
    if(!shader)return;

    cgl.setShader(shader);
    updateLights();
    shader.bindTextures();
    trigger.trigger();
    cgl.setPreviousShader();
};

shader.bindTextures=bindTextures;
shader.define('NUM_LIGHTS','1');

// this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();


};

Ops.Gl.Phong.PhongMaterial.prototype = new CABLES.Op();
CABLES.OPS["0d951d8a-5a69-45b4-876a-92aa1139ed5a"]={f:Ops.Gl.Phong.PhongMaterial,objName:"Ops.Gl.Phong.PhongMaterial"};




// **************************************************************
// 
// Ops.Gl.Meshes.Cube
// 
// **************************************************************

Ops.Gl.Meshes.Cube = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var render=op.inTrigger('render');
var width=op.inValue('width');
var height=op.inValue('height');
var lengt=op.inValue('length');
var center=op.inValueBool('center');

var active=op.inValueBool('Active',true);

var trigger=op.outTrigger('trigger');
var geomOut=op.outObject("geometry");

var cgl=op.patch.cgl;
var geom=null;
var mesh=null;
width.set(1.0);
height.set(1.0);
lengt.set(1.0);
center.set(true);

render.onTriggered=function()
{
    if(active.get() && mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

op.preRender=function()
{
    buildMesh();
    mesh.render(cgl.getShader());
};

function buildMesh()
{
    if(!geom)geom=new CGL.Geometry("cubemesh");
    geom.clear();

    var x=width.get();
    var nx=-1*width.get();
    var y=lengt.get();
    var ny=-1*lengt.get();
    var z=height.get();
    var nz=-1*height.get();

    if(!center.get())
    {
        nx=0;
        ny=0;
        nz=0;
    }
    else
    {
        x*=0.5;
        nx*=0.5;
        y*=0.5;
        ny*=0.5;
        z*=0.5;
        nz*=0.5;
    }

    geom.vertices = [
        // Front face
        nx, ny,  z,
        x, ny,  z,
        x,  y,  z,
        nx,  y,  z,
        // Back face
        nx, ny, nz,
        nx,  y, nz,
        x,  y, nz,
        x, ny, nz,
        // Top face
        nx,  y, nz,
        nx,  y,  z,
        x,  y,  z,
        x,  y, nz,
        // Bottom face
        nx, ny, nz,
        x, ny, nz,
        x, ny,  z,
        nx, ny,  z,
        // Right face
        x, ny, nz,
        x,  y, nz,
        x,  y,  z,
        x, ny,  z,
        // zeft face
        nx, ny, nz,
        nx, ny,  z,
        nx,  y,  z,
        nx,  y, nz
        ];

    geom.setTexCoords( [
          // Front face
          0.0, 1.0,
          1.0, 1.0,
          1.0, 0.0,
          0.0, 0.0,
          // Back face
          1.0, 1.0,
          1.0, 0.0,
          0.0, 0.0,
          0.0, 1.0,
          // Top face
          0.0, 0.0,
          0.0, 1.0,
          1.0, 1.0,
          1.0, 0.0,
          // Bottom face
          1.0, 0.0,
          0.0, 0.0,
          0.0, 1.0,
          1.0, 1.0,
          // Right face
          1.0, 1.0,
          1.0, 0.0,
          0.0, 0.0,
          0.0, 1.0,
          // Left face
          0.0, 1.0,
          1.0, 1.0,
          1.0, 0.0,
          0.0, 0.0,
        ]);

    geom.vertexNormals = [
        // Front face
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

        // Back face
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

        // Top face
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // Bottom face
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

        // Right face
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // Left face
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0
    ];
    geom.tangents = [
        // front face
        -1,0,0, -1,0,0, -1,0,0, -1,0,0,
        // back face
        1,0,0, 1,0,0, 1,0,0, 1,0,0,
        // top face
        1,0,0, 1,0,0, 1,0,0, 1,0,0,
        // bottom face
        -1,0,0, -1,0,0, -1,0,0, -1,0,0,
        // right face
        0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
        // left face
        0,0,1, 0,0,1, 0,0,1, 0,0,1
    ];
    geom.biTangents = [
      // front face
      0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
      // back face
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      // top face
      0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
      // bottom face
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      // right face
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      // left face
      0,1,0, 0,1,0, 0,1,0, 0,1,0
    ];

    geom.verticesIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    if(mesh)mesh.dispose();
    mesh=new CGL.Mesh(cgl,geom);
    geomOut.set(null);
    geomOut.set(geom);
}

width.onChange=buildMesh;
height.onChange=buildMesh;
lengt.onChange=buildMesh;
center.onChange=buildMesh;

buildMesh();

op.onDelete=function()
{
    if(mesh)mesh.dispose();
}

};

Ops.Gl.Meshes.Cube.prototype = new CABLES.Op();
CABLES.OPS["ff0535e2-603a-4c07-9ce6-e9e0db857dfe"]={f:Ops.Gl.Meshes.Cube,objName:"Ops.Gl.Meshes.Cube"};




// **************************************************************
// 
// Ops.Math.Sum
// 
// **************************************************************

Ops.Math.Sum = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    number1=op.inValue("number1",1),
    number2=op.inValue("number2",1),
    result=op.outValue("result");

number1.onChange=
number2.onChange=exec;

function exec()
{
    var v=number1.get()+number2.get();
    if(!isNaN(v)) result.set( v );
}



};

Ops.Math.Sum.prototype = new CABLES.Op();
CABLES.OPS["c8fb181e-0b03-4b41-9e55-06b6267bc634"]={f:Ops.Math.Sum,objName:"Ops.Math.Sum"};




// **************************************************************
// 
// Ops.Gl.Matrix.OrbitControls
// 
// **************************************************************

Ops.Gl.Matrix.OrbitControls = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
const minDist=op.addInPort(new CABLES.Port(op,"min distance",CABLES.OP_PORT_TYPE_VALUE));
const maxDist=op.addInPort(new CABLES.Port(op,"max distance",CABLES.OP_PORT_TYPE_VALUE));

const minRotY=op.inValue("min rot y",0);
const maxRotY=op.inValue("max rot y",0);

const initialAxis=op.addInPort(new CABLES.Port(op,"initial axis y",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
const initialX=op.addInPort(new CABLES.Port(op,"initial axis x",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
const initialRadius=op.inValue("initial radius",0);



const mul=op.addInPort(new CABLES.Port(op,"mul",CABLES.OP_PORT_TYPE_VALUE));

const smoothness=op.inValueSlider("Smoothness",1.0);
const restricted=op.addInPort(new CABLES.Port(op,"restricted",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));

const active=op.inValueBool("Active",true);

const inReset=op.inTriggerButton("Reset");

const allowPanning=op.inValueBool("Allow Panning",true);
const allowZooming=op.inValueBool("Allow Zooming",true);
const allowRotation=op.inValueBool("Allow Rotation",true);
const pointerLock=op.inValueBool("Pointerlock",false);

const speedX=op.inValue("Speed X",1);
const speedY=op.inValue("Speed Y",1);

const trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
const outRadius=op.addOutPort(new CABLES.Port(op,"radius",CABLES.OP_PORT_TYPE_VALUE));
const outYDeg=op.addOutPort(new CABLES.Port(op,"Rot Y",CABLES.OP_PORT_TYPE_VALUE));
const outXDeg=op.addOutPort(new CABLES.Port(op,"Rot X",CABLES.OP_PORT_TYPE_VALUE));

restricted.set(true);
mul.set(1);
minDist.set(0.05);
maxDist.set(99999);

inReset.onTriggered=reset;

const cgl=op.patch.cgl;
var eye=vec3.create();
var vUp=vec3.create();
var vCenter=vec3.create();
var viewMatrix=mat4.create();
var vOffset=vec3.create();

initialAxis.set(0.5);


var mouseDown=false;
var radius=5;
outRadius.set(radius);

var lastMouseX=0,lastMouseY=0;
var percX=0,percY=0;


vec3.set(vCenter, 0,0,0);
vec3.set(vUp, 0,1,0);

var tempEye=vec3.create();
var finalEye=vec3.create();
var tempCenter=vec3.create();
var finalCenter=vec3.create();

var px=0;
var py=0;

var divisor=1;
var element=null;
updateSmoothness();

op.onDelete=unbind;

var doLockPointer=false;

pointerLock.onChange=function()
{
    doLockPointer=pointerLock.get();
    console.log("doLockPointer",doLockPointer);
};

function reset()
{
    px=px%(Math.PI*2);
    py=py%(Math.PI*2);

    percX=(initialX.get()*Math.PI*2);
    percY=(initialAxis.get()-0.5);
    radius=initialRadius.get();
    eye=circlePos( percY );
}

function updateSmoothness()
{
    divisor=smoothness.get()*10+1.0;
}

smoothness.onChange=updateSmoothness;

var initializing=true;

function ip(val,goal)
{
    if(initializing)return goal;
    return val+(goal-val)/divisor;
}

var lastPy=0;

render.onTriggered=function()
{
    cgl.pushViewMatrix();

    px=ip(px,percX);
    py=ip(py,percY);

    var degY=(py+0.5)*180;


    if(minRotY.get()!==0 && degY<minRotY.get())
    {
        degY=minRotY.get();
        py=lastPy;
    }
    else if(maxRotY.get()!==0 && degY>maxRotY.get())
    {
        degY=maxRotY.get();
        py=lastPy;
    }
    else
    {
        lastPy=py;
    }

    outYDeg.set( degY );
    // outXDeg.set( (px)*180 );
    outXDeg.set( (px)*CGL.RAD2DEG );


    circlePosi(eye, py );

    vec3.add(tempEye, eye, vOffset);
    vec3.add(tempCenter, vCenter, vOffset);

    finalEye[0]=ip(finalEye[0],tempEye[0]);
    finalEye[1]=ip(finalEye[1],tempEye[1]);
    finalEye[2]=ip(finalEye[2],tempEye[2]);

    finalCenter[0]=ip(finalCenter[0],tempCenter[0]);
    finalCenter[1]=ip(finalCenter[1],tempCenter[1]);
    finalCenter[2]=ip(finalCenter[2],tempCenter[2]);

    mat4.lookAt(viewMatrix, finalEye, finalCenter, vUp);
    mat4.rotate(viewMatrix, viewMatrix, px, vUp);
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,viewMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
    initializing=false;
};

function circlePosi(vec,perc)
{
    const mmul=mul.get();
    if(radius<minDist.get()*mmul)radius=minDist.get()*mmul;
    if(radius>maxDist.get()*mmul)radius=maxDist.get()*mmul;

    outRadius.set(radius*mmul);

    var i=0,degInRad=0;
    // var vec=vec3.create();
    degInRad = 360*perc/2*CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad)*radius*mmul,
        Math.sin(degInRad)*radius*mmul,
        0);
    return vec;
}


function circlePos(perc)
{
    const mmul=mul.get();
    if(radius<minDist.get()*mmul)radius=minDist.get()*mmul;
    if(radius>maxDist.get()*mmul)radius=maxDist.get()*mmul;

    outRadius.set(radius*mmul);

    var i=0,degInRad=0;
    var vec=vec3.create();
    degInRad = 360*perc/2*CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad)*radius*mmul,
        Math.sin(degInRad)*radius*mmul,
        0);
    return vec;
}

function onmousemove(event)
{
    if(!mouseDown) return;

    var x = event.clientX;
    var y = event.clientY;

    var movementX=(x-lastMouseX)*speedX.get();
    var movementY=(y-lastMouseY)*speedY.get();

    if(doLockPointer)
    {
        movementX=event.movementX*mul.get();
        movementY=event.movementY*mul.get();
    }

    if(event.which==3 && allowPanning.get())
    {
        vOffset[2]+=movementX*0.01*mul.get();
        vOffset[1]+=movementY*0.01*mul.get();
    }
    else
    if(event.which==2 && allowZooming.get())
    {
        radius+=movementY*0.05;
        eye=circlePos(percY);
    }
    else
    {
        if(allowRotation.get())
        {
            percX+=movementX*0.003;
            percY+=movementY*0.002;

            if(restricted.get())
            {
                if(percY>0.5)percY=0.5;
                if(percY<-0.5)percY=-0.5;
            }
        }
    }

    lastMouseX=x;
    lastMouseY=y;
}

function onMouseDown(event)
{
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    mouseDown=true;

    if(doLockPointer)
    {
        var el=op.patch.cgl.canvas;
        el.requestPointerLock = el.requestPointerLock || el.mozRequestPointerLock || el.webkitRequestPointerLock;
        if(el.requestPointerLock) el.requestPointerLock();
        else console.log("no t found");
        // document.addEventListener("mousemove", onmousemove, false);

        document.addEventListener('pointerlockchange', lockChange, false);
        document.addEventListener('mozpointerlockchange', lockChange, false);
        document.addEventListener('webkitpointerlockchange', lockChange, false);
    }
}

function onMouseUp()
{
    mouseDown=false;
    // cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';

    if(doLockPointer)
    {
        document.removeEventListener('pointerlockchange', lockChange, false);
        document.removeEventListener('mozpointerlockchange', lockChange, false);
        document.removeEventListener('webkitpointerlockchange', lockChange, false);

        if(document.exitPointerLock) document.exitPointerLock();
        document.removeEventListener("mousemove", onmousemove, false);
    }
}

function lockChange()
{
    var el=op.patch.cgl.canvas;

    if (document.pointerLockElement === el || document.mozPointerLockElement === el || document.webkitPointerLockElement === el)
    {
        document.addEventListener("mousemove", onmousemove, false);
        console.log("listening...");
    }
}

function onMouseEnter(e)
{
    // cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';
}

initialRadius.onValueChange(function()
{
    radius=initialRadius.get();
    reset();
});

initialX.onValueChange(function()
{
    px=percX=(initialX.get()*Math.PI*2);
});

initialAxis.onValueChange(function()
{
    py=percY=(initialAxis.get()-0.5);
    eye=circlePos(percY);
});

var onMouseWheel=function(event)
{
    if(allowZooming.get())
    {
        var delta=CGL.getWheelSpeed(event)*0.06;
        radius+=(parseFloat(delta))*1.2;

        eye=circlePos(percY);
        event.preventDefault();
    }
};

var ontouchstart=function(event)
{
    doLockPointer=false;
    if(event.touches && event.touches.length>0) onMouseDown(event.touches[0]);
};

var ontouchend=function(event)
{
    doLockPointer=false;
    onMouseUp();
};

var ontouchmove=function(event)
{
    doLockPointer=false;
    if(event.touches && event.touches.length>0) onmousemove(event.touches[0]);
};

active.onChange=function()
{
    if(active.get())bind();
        else unbind();
}


this.setElement=function(ele)
{
    unbind();
    element=ele;
    bind();
}

function bind()
{
    element.addEventListener('mousemove', onmousemove);
    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('mouseup', onMouseUp);
    element.addEventListener('mouseleave', onMouseUp);
    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('contextmenu', function(e){e.preventDefault();});
    element.addEventListener('wheel', onMouseWheel);

    element.addEventListener('touchmove', ontouchmove);
    element.addEventListener('touchstart', ontouchstart);
    element.addEventListener('touchend', ontouchend);
}

function unbind()
{
    if(!element)return;

    element.removeEventListener('mousemove', onmousemove);
    element.removeEventListener('mousedown', onMouseDown);
    element.removeEventListener('mouseup', onMouseUp);
    element.removeEventListener('mouseleave', onMouseUp);
    element.removeEventListener('mouseenter', onMouseUp);
    element.removeEventListener('wheel', onMouseWheel);

    element.removeEventListener('touchmove', ontouchmove);
    element.removeEventListener('touchstart', ontouchstart);
    element.removeEventListener('touchend', ontouchend);
}

eye=circlePos(0);
this.setElement(cgl.canvas);


bind();

initialX.set(0.25);
initialRadius.set(0.05);


};

Ops.Gl.Matrix.OrbitControls.prototype = new CABLES.Op();
CABLES.OPS["eaf4f7ce-08a3-4d1b-b9f4-ebc0b7b1cde1"]={f:Ops.Gl.Matrix.OrbitControls,objName:"Ops.Gl.Matrix.OrbitControls"};




// **************************************************************
// 
// Ops.Math.Multiply
// 
// **************************************************************

Ops.Math.Multiply = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const number1=op.addInPort(new CABLES.Port(op,"number1"));
const number2=op.addInPort(new CABLES.Port(op,"number2"));
const result=op.addOutPort(new CABLES.Port(op,"result"));

function update()
{
    const n1=number1.get();
    const n2=number2.get();

    if(isNaN(n1))n1=0;
    if(isNaN(n2))n2=0;

    result.set( n1*n2 );
}

number1.onChange=update;
number2.onChange=update;

number1.set(1);
number2.set(2);


};

Ops.Math.Multiply.prototype = new CABLES.Op();
CABLES.OPS["1bbdae06-fbb2-489b-9bcc-36c9d65bd441"]={f:Ops.Math.Multiply,objName:"Ops.Math.Multiply"};


