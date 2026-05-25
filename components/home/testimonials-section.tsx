"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "ນາງ ສຸລິສາ",
    location: "ນະຄອນຫຼວງວຽງຈັນ",
    rating: 5,
    text: "ເຂົ້າໜຽວນາປີອົມນຸ່ມ ສົ່ງຖຶງບ້ານຕົງເວລາ ກຳນົດຈຸດສົ່ງງ່າຍຫຼາຍ. ຈະສັ່ງອີກແນ່ນອນ!",
    product: "ເຂົ້ານາປີ",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "ທ່ານ ບຸນມີ",
    location: "ນະຄອນຫຼວງວຽງຈັນ",
    rating: 5,
    text: "ສັ່ງເຂົ້າຈ້າວມະລິອອນລາຍ ສົ່ງໄວ ລາຄາຊັດເຈນ. ພະນັກງານໂທຢືນຢັນກ່ອນສົ່ງ.",
    product: "ເຂົ້າຈ້າວມະລິ",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    name: "ນາງ ວິລະວັນ",
    location: "ນະຄອນຫຼວງວຽງຈັນ",
    rating: 5,
    text: "ເຂົ້ານາແຊງດີ ຫົວຍາວ ຫຸງສົມບູນ. ຈ່າຍ BCEL QR ແລ້ວສົ່ງວັນຖັດມາ.",
    product: "ເຂົ້ານາແຊງ",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            ລູກຄ້າເວົ້າແນວໃດ
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            ຄຳເຫັນຈາກລູກຄ້າທີ່ພໍໃຈກັບຜະລິດຕະພັນຂອງພວກເຮົາ
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 relative"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10" />
              
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                  crossOrigin="anonymous"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>

              <p className="text-foreground mb-3 leading-relaxed">
                {testimonial.text}
              </p>

              <p className="text-sm text-primary font-medium">
                ສິນຄ້າ: {testimonial.product}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
