module.exports = async function get_new_team_name_error(teamName) {
   if (teamName === "") {
      return "Please enter a new team name.";
   }
   return "";
};
