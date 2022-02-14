import { IContext, ISetting } from "../../schema/types";
import { User } from "../../schema/User";

interface IArgs {
  username: string;
  settings: ISetting[];
}

export default async function updateAccount({username, settings}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("updateAccount -> no user found in context");
    return;
  }

  console.log("PH: update Account", username, settings)

  const user = await User.findOne({_id: context.user._id});
  if (user) {
    user.username = username;
    user.settings = settings;
    const doc = await user.save();
    if (doc) {
      return true;
    }
  }

  return false;
}
