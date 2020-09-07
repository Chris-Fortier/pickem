module.exports = async function getNewTeamNameError(teamName) {
   if (teamName === "") {
      return "Please enter a new team name.";
   }
   return "";
};
