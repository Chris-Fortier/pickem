const { get_next_ask_at, get_human_readable_duration } = require("./helpers");

describe("get_next_ask_at()", () => {
   const scenarios = [
      {
         name: "correct with 100% percentage",
         arguments: {
            is_correct: 1,
            next_ask_at: 20,
            last_asked_at: 10,
            num_correct: 5,
            num_incorrect: 0,
            current_datetime: 30,
         },
         expected_result: 70,
      },
      {
         name: "correct with 50% percentage",
         arguments: {
            is_correct: 1,
            next_ask_at: 20,
            last_asked_at: 10,
            num_correct: 5,
            num_incorrect: 5,
            current_datetime: 30,
         },
         expected_result: 60,
      },
      {
         name: "incorrect",
         arguments: {
            is_correct: 0,
            next_ask_at: 20,
            last_asked_at: 10,
            current_datetime: 30,
         },
         expected_result: 35,
      },
      {
         name: "response was too soon",
         arguments: {
            is_correct: 1,
            next_ask_at: 20,
            last_asked_at: 10,
            current_datetime: 18,
         },
         expected_result: 28,
      },
      {
         name: "real incorrect",
         arguments: {
            is_correct: false,
            next_ask_at: 1642615470211,
            last_asked_at: 1642615446231,
            current_datetime: 1642615813433,
         },
         expected_result: 1642615825423,
      },
      {
         name: "real correct",
         arguments: {
            is_correct: true,
            next_ask_at: 1642602097153,
            last_asked_at: 1642576348647,
            num_correct: 6,
            num_incorrect: 7,
            current_datetime: 1642615996744,
         },
         expected_result: 1642673943962.69,
      },
      {
         name: "real correct 2",
         arguments: {
            is_correct: true,
            next_ask_at: 1642615964770,
            last_asked_at: 1642615923499,
            num_correct: 8,
            num_incorrect: 3,
            current_datetime: 1642616368376,
         },
         expected_result: 1642617136799.91,
      },
   ];
   scenarios.forEach((scenario) => {
      test(scenario.name, () => {
         expect(get_next_ask_at(scenario.arguments)).toBeCloseTo(
            scenario.expected_result,
            2
         );
      });
   });
});

describe("get_human_readable_duration()", () => {
   test("results are correct", () => {
      expect(get_human_readable_duration(0)).toEqual("0.0 seconds");
      expect(get_human_readable_duration(5000)).toEqual("5.0 seconds");
      expect(get_human_readable_duration(15000)).toEqual("15 seconds");
      expect(get_human_readable_duration(300000)).toEqual("5.0 minutes");
      expect(get_human_readable_duration(900000)).toEqual("15 minutes");
      expect(get_human_readable_duration(54000000)).toEqual("15.0 hours");
      expect(get_human_readable_duration(432000000)).toEqual("5.0 days");
      expect(get_human_readable_duration(1728000000)).toEqual("2.9 weeks");
      expect(get_human_readable_duration(5000000000)).toEqual("1.9 months");
      expect(get_human_readable_duration(15000000000)).toEqual("5.8 months");
      expect(get_human_readable_duration(50000000000)).toEqual("1.6 years");
      expect(get_human_readable_duration(500000000000)).toEqual("16 years");
   });
});
