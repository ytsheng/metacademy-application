/*global define*/
define(["backbone", "underscore", "lib/kmapjs/models/edge-model", "agfk/collections/goal-collection"], function(Backbone, _, EdgeModel, GoalCollection){
  return EdgeModel.extend({
    defaults: function(){
      var enDef = {
        source: null,
        target: null,
        // TODO FIXME consider moving these to non-saved attributes
        source_goals: new GoalCollection(),
        target_goals: new GoalCollection(),
        middlePts: [],
        isContracted: false,
        isTransitive: false
      };
      return _.extend({}, EdgeModel.prototype.defaults(), enDef);
    },

    parse: function (resp, xhr) {
      // backwards compatability to parse entire server graph TODO remove
      if (!(resp.hasOwnProperty("source") && resp.hasOwnProperty("target"))) {
        return resp;
      }

      var thisModel = this;

      if (resp.hasOwnProperty("source_goals")) {
        if (! (resp.source_goals instanceof GoalCollection)) {
          // assume we're dealing with an array of goal ids
          resp.source_goals = resp.source.get("goals").filter(function (sgoal) {
            return resp.source_goals.indexOf(sgoal.id) != -1;
          });
        }
      } else {
        // add all goals from source unless the goals are specified
        resp.source_goals = resp.source.get("goals").models;
      }
      if (resp.hasOwnProperty("target_goals")) {
        if (!(resp.target_goals instanceof GoalCollection)) {
          // assume we're dealing with an array of goal ids
          resp.target_goals = resp.target.get("goals").filter(function (tgoal) {
            return resp.target_goals.indexOf(tgoal.id) != -1;
          });
        }
      } else {
        // add all goals from target unless the goals are specified
        resp.target_goals = resp.target.get("goals").models;
      }

      var sgColl = thisModel.get("source_goals"),
          tgColl = thisModel.get("target_goals");
      sgColl = sgColl || new GoalCollection();
      tgColl = tgColl || new GoalCollection();

      if (!(resp.source_goals instanceof GoalCollection)) {
        sgColl.add(resp.source_goals);
        resp.source_goals = sgColl;
      }
      if (!(resp.target_goals instanceof GoalCollection)) {
        tgColl.add(resp.target_goals);
        resp.target_goals = tgColl;
      }

      return resp;
    },

    toJSON: function () {
      var thisModel = this;
      if (!thisModel) { return {};}
      var src = thisModel.get("source"),
          tar = thisModel.get("target"),
          srcGoals,
          tarGoals;
      srcGoals = thisModel.get("source_goals").toJSON();
      tarGoals = thisModel.get("target_goals").toJSON();

      return {
        source: src.id,
        target: tar.id,
        reason: thisModel.get("reason") || "",
        id: thisModel.id,
        source_goals: srcGoals,
        target_goals: tarGoals
      };
    }
  });
});
