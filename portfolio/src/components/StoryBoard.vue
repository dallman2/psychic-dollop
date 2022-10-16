<template>
  <q-list class="column justify-center items-center q-pb-xl q-my-md" style="max-width: 900px" :bordered="false" :separator="false"
    :dark="false" :padding="false">
    <q-item style="max-width:850px">
      <q-item-section>
        <q-item-label class="text-h3 text-weight-light text-center">
          A brief, sibling rivalry-fueled forray into Machine Learning using TensorFlow
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-separator class="full-width text-primary q-my-md" size="2px"/>
    <q-item class="row">
      <q-item-section class="col-3 flex-center">
        <q-icon color="secondary" :size="iconSize" name="rocket_launch" />
      </q-item-section>
      <q-item-section class="col-9">
        <q-item-label class="text-h4 text-weight-light">
          It all started with a fun, family game...
        </q-item-label>
        <q-item-label class="text-body1 text-weight-light">
          Many years ago, 12 to be exact, my dad started putting together a weekly NFL pick 'em for the whole family to
          complete.
          Since then, we have completed the Football Pool, as we call it, every single week of the NFL regular season.
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item class="row">
      <q-item-section class="col-9">
        <q-item-label class="text-h4 text-weight-light">
          How does it work?
        </q-item-label>
        <q-item-label class="text-body1 text-weight-light">
          The game is simple, every week, you have to pick a winner for each NFL game based on the money line
          (pick who wins each game, regardless of the spread). Whoever has the most picks correct every week is the
          winner!
          Ties are broken by also predicting the total number of points scored in the Pittsburgh Steeler's game that
          week.
        </q-item-label>
      </q-item-section>
      <q-item-section class="col-3 flex-center">
        <q-icon color="secondary" :size="iconSize" name="assignment" />
      </q-item-section>
    </q-item>
    <q-item class="row">
      <q-item-section class="col-3 flex-center">
        <q-icon color="secondary" :size="iconSize" name="redeem" />
      </q-item-section>
      <q-item-section class="col-9">
        <q-item-label class="text-h4 text-weight-light">
          What is the prize?
        </q-item-label>
        <q-item-label class="text-body1 text-weight-light">
          Bragging rights. However, bragging rights are important sometimes.
          Recently, I had an idea about how to improve my performance in the Football Pool...
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item class="row">
      <q-item-section class="col-9">
        <q-item-label class="text-h4 text-weight-light">
          An idea is born<a href="https://www.youtube.com/watch?v=Ax7QSsP9YDo&ab_channel=p1nk" target="_blank" style="text-decoration: none">!</a>
        </q-item-label>
        <q-item-label class="text-body1 text-weight-light">
          What if I could build a system that predicts the outcome of a football game?
          What about a system that could grade my picks after each week? Maybe such a system
          could help me improve picks that I am only moderately confident in.
        </q-item-label>
      </q-item-section>
      <q-item-section class="col-3 flex-center">
        <q-icon color="secondary" :size="iconSize" name="online_prediction" />
      </q-item-section>
    </q-item>
    <q-item class="row">
      <q-item-section class="col-3 flex-center">
        <q-icon color="secondary" :size="iconSize" name="data_thresholding" />
      </q-item-section>
      <q-item-section class="col-9">
        <q-item-label class="text-h4 text-weight-light">
          Are there patterns in NFL game outcomes?
        </q-item-label>
        <q-item-label class="text-body1 text-weight-light">
          Predicting the outcomes of future events can be hard.
          Predicting the outcome of something as competative as the NFL <b>is</b> very hard.
          In my opinion, games that have already occurred do not have as much as in impact on the outcome
          of a given game as the plays that have occurred in that game. That is to say, if a team is struggling
          on during a given game, that is a better predictor of the outcome than their record coming into that game.
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item class="row">
      <q-item-section class="col-9">
        <q-item-label class="text-h4 text-weight-light">
          Can we formalize a question?
        </q-item-label>
        <q-item-label class="text-body1 text-weight-light">
          Even if predicting the outcome of a game before it starts is too difficult,
          maybe a system that can predict the outcome of a game <b>at a certain point</b>
          during that game would be useful to me. In that case, I can tell the system,
          <i>"Given an ordered list of previous plays in a game, predict the winner of this game"</i>.
        </q-item-label>
      </q-item-section>
      <q-item-section class="col-3 flex-center">
        <q-icon color="secondary" :size="iconSize" name="search" />
      </q-item-section>
    </q-item>
    <q-item class="row">
      <q-item-section class="col-3 flex-center">
        <q-icon color="secondary" :size="iconSize" name="question_mark" />
      </q-item-section>
      <q-item-section class="col-9">
        <q-item-label class="text-h4 text-weight-light">
          How is this useful for the Football Pool?
        </q-item-label>
        <q-item-label class="text-body1 text-weight-light">
          While the system I have described above might not tell me exactly who will win ahead of time,
          it could still grade teams week to week on how realiable they are relative to the points
          <span class="text-info">spread.
            <q-tooltip class="text-body2" max-width="25vw">
              The spread is the number of points statisticians beleive will be the difference between the final scores
            </q-tooltip>
          </span>
          With that data, I could better predict the outcomes of games before they happen, or maybe build another system to do it for me...
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item class="q-pt-xl">
      <q-item-section class="col-12">
        <q-item-label class="text-h4 text-weight-light">
          Lets dive into the design of this system
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-separator class="full-width text-primary q-my-md" size="2px"/>
    <q-item class="row">
      <q-item-section class="col-9">
        <q-item-label class="text-h4 text-weight-light">
          What kind of ML structure do I need?
        </q-item-label>
        <q-item-label class="text-body1 text-weight-light">
          Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello
        </q-item-label>
      </q-item-section>
      <q-item-section class="col-3 flex-center">
        <q-icon color="secondary" :size="iconSize" name="hub" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script>
export default {
  setup(){
    let iconSize = '9vw'
    return {
      iconSize
    }
  }
};
</script>
