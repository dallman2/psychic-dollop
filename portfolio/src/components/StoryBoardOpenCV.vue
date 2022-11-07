<template>
  <q-list class="q-pb-xl q-my-md column items-center" style="max-width: 900px" :bordered="false" :separator="false"
    :dark="false" :padding="false">
    <q-item style="max-width: 850px">
      <q-item-section>
        <q-item-label :class="{
          'text-h3': wide,
          'text-h4': !wide,
          'text-weight-light text-center': true,
        }">
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
        <a href="https://drive.google.com/file/d/1iKdqP7BXwRY0l_3-FxBx6pX7etZya3wt/view?usp=sharing"
          target="_blank">thesis</a>,
        especially with a library like OpenCV. I had used it extensively in both my undergradutae and graduate
        education,
        but always within the context of a C++ project.
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="public">
      <template #label> Why not bring it to the web? </template>
      <template #content>
        While what I was able to do with OpenCV in the past was cool, I really wanted people to be
        able to experience what was possible with the library without the pain of setting up a
        developer environment or having to install a standalone binary. Surely, there must be a version
        of this library written in JavaScript, right?
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="event_available" :left="true">
      <template #label> Easy enough... </template>
      <template #content>
        The basic overview of the process to use OpenCV on the web is simple. Download the
        pre-compiled JavaScript file from their
        <a href="https://docs.opencv.org/4.6.0/d0/d84/tutorial_js_usage.html" target="_blank">website</a>
        and create a <code>script</code> tag reffering to the file to use it in other code. Better yet, there
        are also pre-compiled versions of OpenCV available as
        <a href="https://www.npmjs.com/package/@techstark/opencv-js" target="_blank">NPM modules</a>. The developer
        experience is made even smoother with the <code>mirada</code>&nbsp;
        <a href="https://www.npmjs.com/package/mirada" target="_blank">typing module</a>. This should allow me to easily
        set up some basic computer vision and 3D reconstruction examples.
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="event_busy">
      <template #label>
        Or so I thought
      </template>
      <template #content>
        Setting up a scene and some cameras with <code><a href="https://threejs.org/" target="_blank">Three.js</a></code>
        was fairly easy, as was setting up a stereo vision system in that scene. Effeciently moving the data from a given
        stereo vision frame into an OpenCV <code>Mat</code> fell into place not long after. However, I came across a problem
        when trying to use some of the 3D calibration and reconstruction functions. They were <b>not there</b>!
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="data_thresholding" :left="true">
      <template #label> Are there patterns in NFL game outcomes? </template>
      <template #content>
        Predicting the outcomes of future events can be hard. Predicting the
        outcome of something as competative as the NFL <b>is</b> very hard. In
        my opinion, games that have already occurred do not have as much of in
        impact on the outcome of a given game as the plays that have occurred in
        that game. That is to say, if a team is struggling on during a given
        game, that is a better predictor of the outcome than their record coming
        into that game.
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="search">
      <template #label> Can we formalize a question? </template>
      <template #content>
        Even if predicting the outcome of a game before it starts is too
        difficult, maybe a system that can predict the outcome of a game
        <b>at a certain point</b>
        during that game would be useful to me. In that case, I can tell the
        system,
        <i>"Given an ordered list of previous plays in a game, predict the
          winner of this game"</i>.
      </template>
    </StoryPoint>
    <StoryPoint :wide="wide" icon="question_mark" :left="true">
      <template #label> How is this useful for the Football Pool? </template>
      <template #content>
        While the system I have described above might not tell me exactly who
        will win ahead of time, it could still grade teams week to week on how
        realiable they are relative to the points
        <span class="text-info">spread.
          <q-tooltip class="text-body2" max-width="25vw">
            The spread is the number of points statisticians beleive will be the
            difference between the final scores
          </q-tooltip>
        </span>
        With that data, I could better predict the outcomes of games before they
        happen, or maybe build another system to do it for me...
      </template>
    </StoryPoint>
    <q-item class="q-pt-xl">
      <q-item-section class="col-12">
        <q-item-label :class="{
          'text-h3': wide,
          'text-h4': !wide,
          'text-weight-light text-center': true,
        }">
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
