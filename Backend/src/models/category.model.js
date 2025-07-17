import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const categorySchema = new Schema(
  {
    //created by admin
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
    },
    image: {
      type: String,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    metadata: {
      seoTitle: String,
      seoDescription: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();

  this.slug = this.name

    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();

  next();
});

categorySchema.virtual("subcategory",{
  ref:"Category",
  localField:"_id",
  foreignField:"parent"
})
categorySchema.plugin(mongooseAggregatePaginate);
export const Category = mongoose.model("category", categorySchema);
