<template>
  <q-list
    class="q-pb-xl q-my-md column items-center"
    style="max-width: 900px"
    :bordered="false"
    :separator="false"
    :dark="false"
    :padding="false"
  >
    <q-item style="max-width: 850px">
      <q-item-section>
        <q-item-label
          :class="{
            'text-h3': wide,
            'text-h4': !wide,
            'text-weight-light text-center': true,
          }"
        >
          <span>
            OpenCV.js or: How I Learned to Stop Worrying and Love Emscripten
          </span>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-separator class="full-width text-primary q-my-md" size="2px" />
    <StoryPoint :wide="wide" icon="school" :left="true">
      <template #label> I wanted to recreate my Master's Thesis </template>
      <template #content>
        I was no stranger to computer vision by time I wrote my
        <a
          href="https://drive.google.com/file/d/1iKdqP7BXwRY0l_3-FxBx6pX7etZya3wt/view?usp=sharing"
          target="_blank"
          >thesis</a
        >, especially with a library like OpenCV. I had used it extensively in
        both my undergradutae and graduate education, but always within the
        context of a C++ project.
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="public">
      <template #label> Why not bring it to the web? </template>
      <template #content>
        While what I was able to do with OpenCV in the past was cool, I really
        wanted people to be able to experience what was possible with the
        library without the pain of setting up a developer environment or having
        to install a standalone binary. Surely, there must be a version of this
        library written in JavaScript, right?
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="event_available" :left="true">
      <template #label> Easy enough... </template>
      <template #content>
        The basic overview of the process to use OpenCV on the web is simple.
        Download the pre-compiled JavaScript file from their
        <a
          href="https://docs.opencv.org/4.6.0/d0/d84/tutorial_js_usage.html"
          target="_blank"
          >website</a
        >
        and create a <code>script</code> tag reffering to the file to use it in
        other code. Better yet, there are also pre-compiled versions of OpenCV
        available as
        <a
          href="https://www.npmjs.com/package/@techstark/opencv-js"
          target="_blank"
          >NPM modules</a
        >. The developer experience is made even smoother with the
        <code>mirada</code>&nbsp;
        <a href="https://www.npmjs.com/package/mirada" target="_blank"
          >typing module</a
        >. This should allow me to easily set up some basic computer vision and
        3D reconstruction examples.
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="event_busy">
      <template #label> Or so I thought </template>
      <template #content>
        Setting up a scene and some cameras with
        <code><a href="https://threejs.org/" target="_blank">Three.js</a></code>
        was fairly easy, as was setting up a stereo vision system in that scene.
        Effeciently moving the data from a given stereo vision frame into an
        OpenCV <code>Mat</code> fell into place not long after. However, I came
        across a problem when trying to use some of the 3D calibration and
        reconstruction functions. They were <b>not there</b>!
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="data_thresholding" :left="true">
      <template #label> Where are the functions? </template>
      <template #content>
        It took me a while to figure out exactly where the fault was. The typing
        package I was using contained the definitions for the functions I was
        looking for, but when inspecting the OpenCV object in the browser, the
        functions were not there. After some Googling, it became clear that the
        default script used to compile the C++ OpenCV library to WebAssembly
        <b>does not include all of the library's functions</b>. After a little
        bit more Googling, I realized that to get the functions I needed, I had
        to build the library manually. OpenCV provides a
        <a
          href="https://docs.opencv.org/4.x/d4/da1/tutorial_js_setup.html"
          target="_blank"
          >guide</a
        >
        how to build OpenCV for web use, but does not state how to change what
        functions are included in that build.
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="search">
      <template #label> All roads lead to python </template>
      <template #content>
        Eventually, I found a
        <a
          href="https://github.com/opencv/opencv/tree/4.x/platforms/js"
          target="_blank"
          >directory</a
        >
        in the OpenCV codebase that contains two specific files; a
        <a
          href="https://github.com/opencv/opencv/blob/4.x/platforms/js/build_js.py"
          target="_blank"
          >build file</a
        >
        and a
        <a
          href="https://github.com/opencv/opencv/blob/4.x/platforms/js/opencv_js.config.py"
          target="_blank"
          >config file</a
        >. The build file represents a system to call
        <code>emscripten</code> with the proper configuration, while the config
        file includes the list of functions to be included in the build.
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="question_mark" :left="true">
      <template #label> Tying up loose ends </template>
      <template #content> </template>
    </StoryPoint>
    <q-item class="q-pt-xl">
      <q-item-section class="col-12">
        <q-item-label
          :class="{
            'text-h3': wide,
            'text-h4': !wide,
            'text-weight-light text-center': true,
          }"
        >
          Lets dive into the design of this system
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-separator class="full-width text-primary q-my-md" size="2px" />
    <StoryPoint :wide="wide" icon="hub">
      <template #label> What kind of ML structure do I need? </template>
      <template #content> Hello </template>
    </StoryPoint>
  </q-list>
</template>
<script>
import StoryPoint from './StoryPoint.vue';
export default {
  components: { StoryPoint },
  props: ['wide'],
};
</script>
