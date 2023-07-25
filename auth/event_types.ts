
  interface UsernameUpdated extends Event {
    type: "UsernameUpdated";
    data: {
      user_id: number;
      user_name: string;
    };
  }
  interface EmailUpdated extends Event {
    type: "EmailUpdated";
    data: {
      user_id: number;
      email: string;
    };
  }
  interface Event {
    type: string;
    data: any;
  }

  export{
    UsernameUpdated,
    EmailUpdated,
    Event

  }