import { FormBlock, FormField } from "@/components/custom/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import z from "zod";

const countries = [
  {
    value: "india",
    label: "India",
    flag: "https://cdn.shadcnstudio.com/ss-assets/flags/india.png",
  },
  {
    value: "china",
    label: "China",
    flag: "https://cdn.shadcnstudio.com/ss-assets/flags/china.png",
  },
  {
    value: "monaco",
    label: "Monaco",
    flag: "https://cdn.shadcnstudio.com/ss-assets/flags/monaco.png",
  },
  {
    value: "serbia",
    label: "Serbia",
    flag: "https://cdn.shadcnstudio.com/ss-assets/flags/serbia.png",
  },
  {
    value: "romania",
    label: "Romania",
    flag: "https://cdn.shadcnstudio.com/ss-assets/flags/romania.png",
  },
  {
    value: "mayotte",
    label: "Mayotte",
    flag: "https://cdn.shadcnstudio.com/ss-assets/flags/mayotte.png",
  },
  {
    value: "iraq",
    label: "Iraq",
    flag: "https://cdn.shadcnstudio.com/ss-assets/flags/iraq.png",
  },
  {
    value: "syria",
    label: "Syria",
    flag: "https://cdn.shadcnstudio.com/ss-assets/flags/syria.png",
  },
  {
    value: "korea",
    label: "Korea",
    flag: "https://cdn.shadcnstudio.com/ss-assets/flags/korea.png",
  },
  {
    value: "zimbabwe",
    label: "Zimbabwe",
    flag: "https://cdn.shadcnstudio.com/ss-assets/flags/zimbabwe.png",
  },
];

function TestFormView() {
  const formSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    mobile: z.string(),
    country: z.string(),
    gender: z.string(),
    role: z.string(),
  });

  const defaultValues = {
    firstName: "",
    lastName: "",
    mobile: "",
    country: "",
    gender: "",
    role: "",
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };
  return (
    <div>
      <section className="py-3">
        <div className="mx-auto max-w-7xl">
          <FormBlock
            label="這是標題"
            description="這是描述"
            formSchema={formSchema}
            onSubmit={onSubmit}
            defaultValues={defaultValues}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField name="firstName" label="First Name">
                <Input placeholder="John" />
              </FormField>
              <FormField name="lastName" label="Last Name">
                <Input placeholder="Deo" />
              </FormField>
              <FormField name="mobile" label="Mobile">
                <Input type="tel" placeholder="+1 (555) 123-4567" />
              </FormField>
              <FormField name="country" label="Country">
                {(field, id) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={id}
                      className="[&>span_svg]:text-muted-foreground/80 w-full [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="[&_*[role=option]>span>svg]:text-muted-foreground/80 max-h-100 [&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0">
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          <img
                            src={country.flag}
                            alt={`${country.label} flag`}
                            className="h-4 w-5"
                          />{" "}
                          <span className="truncate">{country.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
              <FormField name="gender" label="Gender">
                {(field, id) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={id} className="w-full">
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </FormField>
              <FormField name="role" label="Role">
                {(field, id) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={id} className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            </div>
          </FormBlock>
          <Separator className="my-10" />
        </div>
      </section>
    </div>
  );
}

export default TestFormView;
