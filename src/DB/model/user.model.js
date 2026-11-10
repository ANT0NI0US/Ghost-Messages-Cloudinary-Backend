import mongoose from "mongoose";
import { enums, events, exceptions, security } from "../../common/index.js";
import configService from "../../../config/config.service.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: [2, "validation.firstName.min"],
      maxLength: [30, "validation.firstName.max"],
      required: [true, "validation.firstName.required"],
    },
    lastName: {
      type: String,
      minLength: [2, "validation.lastName.min"],
      maxLength: [30, "validation.lastName.max"],
      required: [
        function () {
          return this.provider == enums.ProviderEnum.SYSTEM;
        },
        "validation.lastName.required",
      ],
    },
    email: {
      type: String,
      required: [true, "validation.email.required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      // don't return the password in any query unless we ask for it explicitly with "+password"
      select: false,
      required: [
        function () {
          return this.provider == enums.ProviderEnum.SYSTEM;
        },
        "validation.password.required",
      ],
    },
    phone: String,
    DOB: Date,
    confirmEmail: Date,
    // we use this when we upload this in assets only
    // image: String,
    // we use this when we upload this in cloudinary only
    image: {
      public_id: String,
      secure_url: String,
    },
    // we use this when we upload this in assets only
    // coverImage: [String],
    // we use this when we upload this in cloudinary only
    coverImages: [
      {
        public_id: String,
        secure_url: String,
      },
    ],
    gender: {
      type: Number,
      enum: {
        values: Object.values(enums.GenderEnum),
        message: "validation.gender.invalid",
      },
      default: enums.GenderEnum.MALE,
    },
    role: {
      type: Number,
      enum: {
        values: Object.values(enums.RoleEnum),
        message: "validation.role.invalid",
      },
      default: enums.RoleEnum.USER,
    },
    provider: {
      type: Number,
      enum: {
        values: Object.values(enums.ProviderEnum),
        message: "validation.provider.invalid",
      },
      default: enums.ProviderEnum.SYSTEM,
    },
    changeCredentialsTime: Date,
    twoStepVerification: { type: Boolean, default: false },
    status: {
      type: Number,
      enum: {
        values: Object.values(enums.AccountStatusEnum),
        message: "validation.status.invalid",
      },
      default: enums.AccountStatusEnum.ACTIVE,
    },
    changeStatusAt: Date,
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      // remove the password from any JSON output (res.json, toJSON, JSON.stringify for redis cache)
      // even if the document was loaded with "+password" (like in login and basicAuth)
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    strict: true,
    autoIndex: true,
    strictQuery: true,
    optimisticConcurrency: true,
  },
);

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.set({ firstName, lastName: rest.join(" ") });
  })
  .get(function () {
    return [this.firstName, this.lastName].filter(Boolean).join(" ");
  });

// make sure that there is no password when the provider is not a ProviderEnum.SYSTEM
userSchema.pre("validate", function () {
  if (this.provider != enums.ProviderEnum.SYSTEM && this.password) {
    throw exceptions.BadRequestException({
      message: "error.googleAccountCannotHoldPassword",
    });
  }
});

// hash and encrypt the password and phone before saving the user document
userSchema.pre("save", async function () {
  this.wasNew = this.isNew;
  if (this.isModified("password")) {
    this.password = await security.hash({ plainText: this.password });
  }
  if (this.isModified("phone")) {
    this.phone = await security.encrypt(this.phone);
  }
});

// after the first save only (signup / gmail signup) → notify the app email that a new user joined
userSchema.post("save", function () {
  if (!this.wasNew) return;

  events.emailEvent.emit(enums.EventsEnum.SEND_EMAIL, {
    recipient: { to: configService.APP_EMAIL },
    subject: enums.EmailSubjectEnum.NEW_USER_REGISTERED,
    data: {
      lang: enums.LanguageEnum.EN,
      // only the fields we need, never send the document itself (it holds the hashed password)
      user: {
        username: this.username,
        email: this.email,
        provider: this.provider,
        createdAt: this.createdAt,
      },
    },
  });
});

// return in ["find", "findOne", "countDocuments"] only the users that are not archived unless the query has a property called "paranoid" with a value of false
userSchema.pre(["find", "findOne", "countDocuments"], async function () {
  const query = this.getFilter();

  if (query.paranoid != false)
    this.setQuery({
      ...query,
      status: { $ne: enums.AccountStatusEnum.ARCHIVE },
    });
});

// change the status + allow update in Active documents only + change the changeStatusAt when i change in the status
userSchema.pre(
  ["updateOne", "updateMany", "findOneAndUpdate"],
  async function () {
    const query = this.getFilter();
    const update = this.getUpdate();

    // pipeline update is an array, spreading it below would break it, so only hide the archived users
    if (Array.isArray(update)) {
      if (query.paranoid != false)
        this.setQuery({
          ...query,
          status: { $ne: enums.AccountStatusEnum.ARCHIVE },
        });
      return;
    }

    if (update.status == enums.AccountStatusEnum.ACTIVE) {
      this.setQuery({
        ...query,
        status: { $eq: enums.AccountStatusEnum.ARCHIVE },
      });
    } else if (update.status == enums.AccountStatusEnum.ARCHIVE) {
      this.setQuery({
        ...query,
        status: { $eq: enums.AccountStatusEnum.ACTIVE },
      });
    }

    const hasStatus = update.status !== undefined;

    if (!hasStatus && query.paranoid != false)
      this.setQuery({
        ...query,
        status: { $ne: enums.AccountStatusEnum.ARCHIVE },
      });

    this.setUpdate({
      ...this.getUpdate(),
      ...(hasStatus ? { changeStatusAt: new Date() } : {}),
    });
  },
);

// hard delete when i have an archive document or when i have force:true
userSchema.pre(
  ["deleteOne", "deleteMany", "findOneAndDelete"],
  async function () {
    const query = this.getFilter();

    if (!query.force)
      this.setQuery({
        ...query,
        status: { $eq: enums.AccountStatusEnum.ARCHIVE },
      });
  },
);

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);
