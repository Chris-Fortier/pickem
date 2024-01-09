import TEAM_NAMES from "../utils/TEAM_NAMES";

export const validate_game_week = (input) => {
   if (!isNaN(input)) {
      return parseInt(input) > 0 && parseInt(input) <= 18;
   }
   return false;
};

export const convert_date_string_to_ms = (input) => {
   if (input.split("/").length !== 3) {
      return null;
   } else if (
      input.split("/")[2].length !== 2 &&
      input.split("/")[2].length !== 4
   ) {
      return null;
   }
   const date = new Date(input);
   if (isNaN(date)) {
      return null;
   }
   return date.getTime();
};

export const validate_game_date = (input) => {
   const date = convert_date_string_to_ms(input);

   if (date === null) {
      return false;
   }
   return true;
};

export const convert_to_tod_ms = (input) => {
   let hour = 0;
   let min = 0;

   if (input.includes(":")) {
      hour = parseInt(input.split(":")[0]);
      if (input.split(":")[1].length === 2) {
         min = parseInt(input.split(":")[1]);
      } else {
         return null;
      }
   } else {
      hour = parseInt(input.slice(-4, -2));
      min = parseInt(input.slice(-2));
   }
   // console.log(input, hour, min);
   if (isNaN(hour)) {
      return null;
   }
   if (hour >= 23) {
      return null;
   }
   if (hour < 0) {
      return null;
   }
   if (min >= 60) {
      return null;
   }
   if (min < 0) {
      return null;
   }

   const tod_ms = hour * 3600000 + min * 60000;
   if (isNaN(tod_ms)) {
      return false;
   }
   return tod_ms;
};

export const validate_time = (input) => {
   const result = convert_to_tod_ms(input);
   if (result === null) {
      return false;
   }
   return true;
};

export const validate_team_abbr = (input) => {
   if (input && TEAM_NAMES.hasOwnProperty(input.toUpperCase())) {
      return true;
   }
   return false;
};

export const validate_game_value = (input) => {
   if (!isNaN(input)) {
      return parseInt(input) > 0 && parseInt(input) <= 16;
   }
   return false;
};

export const validate_game_score = (input) => {
   if (!isNaN(input)) {
      return parseInt(input) >= 0 && parseInt(input) <= 100;
   }
   return false;
};

export const test = () => {
   let num_failed_tests = 0;
   const scenarios = [
      {
         function: validate_game_week,
         arguments: 1,
         expected_result: true,
      },
      {
         function: validate_game_week,
         arguments: 18,
         expected_result: true,
      },
      {
         function: validate_game_week,
         arguments: 0,
         expected_result: false,
      },
      {
         function: validate_game_week,
         arguments: 0,
         expected_result: false,
      },
      {
         function: validate_game_week,
         arguments: "abc",
         expected_result: false,
      },
      {
         function: validate_game_date,
         arguments: "1/8/2024",
         expected_result: true,
      },
      {
         function: validate_game_date,
         arguments: "1/81/2024",
         expected_result: false,
      },
      {
         function: validate_game_date,
         arguments: "1/1/1",
         expected_result: false,
      },
      {
         function: validate_game_date,
         arguments: "10/10/1",
         expected_result: false,
      },
      {
         function: convert_date_string_to_ms,
         arguments: "1/8/2024",
         expected_result: 1704700800000,
      },
      {
         function: convert_date_string_to_ms,
         arguments: "5/5/5",
         expected_result: null,
      },
      {
         function: convert_date_string_to_ms,
         arguments: "5/5/50",
         expected_result: -620413200000,
      },
      {
         function: convert_date_string_to_ms,
         arguments: "5/5/500",
         expected_result: null,
      },
      {
         function: convert_date_string_to_ms,
         arguments: "5/5",
         expected_result: null,
      },
      {
         function: convert_to_tod_ms,
         arguments: "00:00",
         expected_result: 0,
      },
      {
         function: convert_to_tod_ms,
         arguments: "00:01",
         expected_result: 60000,
      },
      {
         function: convert_to_tod_ms,
         arguments: "01:00",
         expected_result: 3600000,
      },
      {
         function: convert_to_tod_ms,
         arguments: "0100",
         expected_result: 3600000,
      },
      {
         function: convert_to_tod_ms,
         arguments: "abc",
         expected_result: null,
      },
      {
         function: convert_to_tod_ms,
         arguments: "00:60",
         expected_result: null,
      },
      {
         function: convert_to_tod_ms,
         arguments: "24:00",
         expected_result: null,
      },
      {
         function: convert_to_tod_ms,
         arguments: "-01:00",
         expected_result: null,
      },
      {
         function: convert_to_tod_ms,
         arguments: "-1:00",
         expected_result: null,
      },
      {
         function: convert_to_tod_ms,
         arguments: "01:-01",
         expected_result: null,
      },
      {
         function: convert_to_tod_ms,
         arguments: "01:-1",
         expected_result: null,
      },
      {
         function: convert_to_tod_ms,
         arguments: "1715",
         expected_result: 62100000,
      },
      {
         function: convert_to_tod_ms,
         arguments: "1",
         expected_result: null,
      },
      {
         function: convert_to_tod_ms,
         arguments: "9:30",
         expected_result: 32400000 + 1800000,
      },
      {
         function: convert_to_tod_ms,
         arguments: "9:1",
         expected_result: null,
      },
      {
         function: convert_to_tod_ms,
         arguments: "12",
         expected_result: null,
      },
      {
         function: validate_team_abbr,
         arguments: "SEA",
         expected_result: true,
      },
      {
         function: validate_team_abbr,
         arguments: "ari",
         expected_result: true,
      },
      {
         function: validate_team_abbr,
         arguments: "GB",
         expected_result: true,
      },
      {
         function: validate_team_abbr,
         arguments: "ne",
         expected_result: true,
      },
      {
         function: validate_team_abbr,
         arguments: "OAK",
         expected_result: false,
      },
      {
         function: validate_team_abbr,
         arguments: "oak",
         expected_result: false,
      },
   ];
   console.log(`Running ${scenarios.length} test(s)...`);
   scenarios.forEach((scenario) => {
      const result = scenario.function(scenario.arguments);
      if (result != scenario.expected_result) {
         console.log(
            `${scenario.function.name}(${scenario.arguments}) == ${result} but expected ${scenario.expected_result}.`
         );
         num_failed_tests += 1;
      }
   });
   if (num_failed_tests) {
      console.log(`Failed ${num_failed_tests} tests.`);
   } else {
      console.log("All tests passed!");
   }
};

// module.exports = { validate_game_week };
