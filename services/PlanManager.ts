import { User, PlanLevel } from "../context/AuthContext";

class PlanManager {
  private static plans: any = {};
  private static upsellTriggers: any = {};

  static initialize(config: any) {
    this.plans = config.subscription_plans || {};
    this.upsellTriggers = config.global_upsell_triggers || {};
  }

  static getPlanFeature(planLevel: PlanLevel, featurePath: string): any {
    const plan = this.plans[planLevel];
    if (!plan) return null;

    return featurePath
      .split(".")
      .reduce(
        (obj: any, key: string) =>
          obj && obj[key] !== undefined ? obj[key] : undefined,
        plan,
      );
  }

  static validateDailyLimit(
    user: User & { checkDailyReset?: () => void },
  ): any {
    if (user.checkDailyReset) {
      user.checkDailyReset();
    }

    const dailyLimit = this.getPlanFeature(
      user.planLevel,
      "access.daily_limit",
    );

    if (user.usage.generationsCount >= dailyLimit) {
      return this.upsellTriggers.on_limit_reached;
    }
    return null;
  }

  static getUpsellMessage(triggerKey: string): string {
    return this.upsellTriggers[triggerKey] || "Actualiza tu plan para acceder a esta función.";
  }
}

export default PlanManager;
